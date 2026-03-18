import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * IP bazlı konum izin gerektirmez, fallback olarak kullanılır.
 */
export const getLocationByIP = async (): Promise<{ lat: number; lng: number } | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = await res.json()
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Koordinattan şehir + ülke bilgisi al.
 * OpenStreetMap Nominatim ücretsiz, API key gerektirmez.
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{ city: string; country: string; country_code: string } | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ONE-App/1.0',
        },
      }
    )
    if (!res.ok) return null
    const data = await res.json()

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Unknown'

    const country = data.address?.country || 'Unknown'
    const country_code = (data.address?.country_code || 'xx').toUpperCase()

    return { city, country, country_code }
  } catch {
    return null
  }
}

/**
 * Bugün bu kullanıcı zaten çekim yaptı mı kontrol et.
 */
export const checkTodayCapture = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Aktif pencere varsa pencere bazlı kontrol, yoksa günlük kontrol
    const win = await getTodayWindow()
    let query = supabase.from('posts').select('id').eq('user_id', user.id)

    if (win && isWindowActive(win)) {
      // Pencere açıksa: bu pencere bloğunda çekim yapıldı mı?
      query = query
        .eq('window_block', win.block)
        .gte('captured_at', win.window_start)
        .lte('captured_at', win.window_end)
    } else {
      // Pencere kapalıysa: bugün herhangi bir çekim yapıldı mı?
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query = query.gte('captured_at', today.toISOString())
    }

    const { data, error } = await query.limit(1)

    if (error) {
      console.error("checkTodayCapture error:", error.message)
      return false
    }

    return !!data && data.length > 0
  } catch (err) {
    console.error("checkTodayCapture system error:", err)
    return false
  }
}

/**
 * Videoyu Storage'a yükle, metadata + konum bilgisini DB'ye kaydet.
 */
export const uploadMoment = async (
  file: File,
  coords?: { lat: number; lng: number } | null,
  capturedAt?: string,
  durationSec?: number
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No active session found.")

  const fileExt = file.name.split('.').pop() || 'webm'
  const fileName = `${user.id}/one_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  // 1. Storage'a yükle
  const { data: storageData, error: storageError } = await supabase.storage
    .from('posts')
    .upload(fileName, file, {
      upsert: false,
      cacheControl: '3600',
    })

  if (storageError) throw new Error(storageError.message)

  // 2. Public URL al
  const { data: urlData } = supabase.storage
    .from('posts')
    .getPublicUrl(storageData.path)

  const publicUrl = urlData?.publicUrl || null

  // 3. Reverse geocode koordinattan şehir/ülke al
  let finalCoords = coords
  if (!finalCoords) {
    finalCoords = await getLocationByIP()
  }

  let geoData: { city: string; country: string; country_code: string } | null = null
  if (finalCoords) {
    geoData = await reverseGeocode(finalCoords.lat, finalCoords.lng)
  }

  // 4. DB'ye kaydet
  const { error: dbError } = await supabase
    .from('posts')
    .insert([{
      user_id: user.id,
      file_path: storageData.path,
      file_url: publicUrl,
      latitude: finalCoords?.lat || null,
      longitude: finalCoords?.lng || null,
      location_point: finalCoords ? `POINT(${finalCoords.lng} ${finalCoords.lat})` : null,
      city: geoData?.city || null,
      country: geoData?.country || null,
      country_code: geoData?.country_code || null,
      captured_at: capturedAt || new Date().toISOString(),
      duration_sec: durationSec || null,
      window_block: await getTodayWindow().then(w => w?.block || null),
    }])

  if (dbError) throw new Error(dbError.message)

  return publicUrl || storageData.path
}

/**
 * DailyWindow yapısı ve yardımcı fonksiyonlar.
 */
export interface DailyWindow {
  id: string;
  date: string;
  block: 'sabah' | 'ogle' | 'aksam';
  window_start: string;
  window_end: string;
  is_global: boolean;
}

export const getTodayWindow = async (): Promise<DailyWindow | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_windows')
      .select('*')
      .eq('date', today)
      .single();

    if (error || !data) return null;
    return data as DailyWindow;
  } catch {
    return null;
  }
}

export const isWindowActive = (win: DailyWindow | null): boolean => {
  if (!win) return false;
  const now = new Date();
  const start = new Date(win.window_start);
  const end = new Date(win.window_end);
  return now >= start && now <= end;
}
/**
 * Kullanıcı profil konumunu güncelle — giriş yapınca çağrılır.
 */
export const updateProfileLocation = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Mevcut profil konumuna bak
    const { data: profile } = await supabase
      .from('profiles')
      .select('city, country, country_code')
      .eq('id', user.id)
      .single()

    // Zaten konum varsa güncelleme
    if (profile?.city && profile.city !== 'Unknown') return

    // GPS dene, olmazsa IP fallback
    let coords: { lat: number; lng: number } | null = null
    try {
      coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => reject(),
          { timeout: 8000, enableHighAccuracy: false }
        )
      })
    } catch {
      coords = await getLocationByIP()
    }

    if (!coords) return

    const geo = await reverseGeocode(coords.lat, coords.lng)
    if (!geo) return

    await supabase
      .from('profiles')
      .update({
        city: geo.city,
        country: geo.country,
        country_code: geo.country_code,
        latitude: coords.lat,
        longitude: coords.lng,
        location_point: `POINT(${coords.lng} ${coords.lat})`,
      })
      .eq('id', user.id)
  } catch (err) {
    console.error('updateProfileLocation error:', err)
  }
}
