import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Koordinattan şehir + ülke bilgisi al.
 * OpenStreetMap Nominatim — ücretsiz, API key gerektirmez.
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id)
      .gte('captured_at', today.toISOString())
      .limit(1)

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
  capturedAt?: string
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

  // 3. Reverse geocode — koordinattan şehir/ülke al
  let geoData: { city: string; country: string; country_code: string } | null = null
  if (coords) {
    geoData = await reverseGeocode(coords.lat, coords.lng)
  }

  // 4. DB'ye kaydet
  const { error: dbError } = await supabase
    .from('posts')
    .insert([{
      user_id: user.id,
      file_path: storageData.path,
      file_url: publicUrl,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
      location_point: coords ? `POINT(${coords.lng} ${coords.lat})` : null,
      city: geoData?.city || null,
      country: geoData?.country || null,
      country_code: geoData?.country_code || null,
      captured_at: capturedAt || new Date().toISOString(),
    }])

  if (dbError) throw new Error(dbError.message)

  return publicUrl || storageData.path
}
