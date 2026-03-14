import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
 * ════════════════════════════════════════════════════════
 *  SUPABASE KURULUM — Aşağıdaki SQL'i bir kez çalıştır:
 *  Supabase Dashboard → SQL Editor → New Query → Çalıştır
 * ════════════════════════════════════════════════════════
 *
 * -- PostGIS extension (konum için gerekli)
 * CREATE EXTENSION IF NOT EXISTS postgis;
 *
 * -- posts tablosunu oluştur
 * CREATE TABLE IF NOT EXISTS public.posts (
 *   id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id        uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
 *   file_path      text        NOT NULL,
 *   location_name  text,
 *   location_point geography(POINT, 4326),
 *   captured_at    timestamptz DEFAULT now(),
 *   created_at     timestamptz DEFAULT now()
 * );
 *
 * -- Row Level Security aç
 * ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
 *
 * -- Kullanıcı sadece kendi postunu ekleyebilir
 * CREATE POLICY "Users can insert own posts"
 *   ON public.posts FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 *
 * -- Herkes okuyabilir (Global Feed)
 * CREATE POLICY "Anyone can read posts"
 *   ON public.posts FOR SELECT
 *   USING (true);
 *
 * -- Storage: Dashboard → Storage → New Bucket
 * -- Bucket adı: "posts" → Public: true
 * ════════════════════════════════════════════════════════
 */

/**
 * Bugün bu kullanıcı zaten çekim yaptı mı kontrol et.
 * user_id filtresi eklendi — başkasının postu sayılmıyordu.
 */
export const checkTodayCapture = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // RLS'den bağımsız — kendi postunu her durumda görmesi için
    // moderation_status veya is_visible filtresi YOK
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
 * Videoyu Storage'a yükle, metadata'yı DB'ye kaydet.
 * user_id artık insert'e dahil — RLS politikası için zorunlu.
 */
export const uploadMoment = async (
  file: File,
  coords?: { lat: number; lng: number } | null,
  capturedAt?: string
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No active session found.")

  const fileExt = file.name.split('.').pop() || 'mp4'
  const fileName = `${user.id}/one_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

  // 1. Videoyu Storage'a yükle
  const { data: storageData, error: storageError } = await supabase.storage
    .from('posts')
    .upload(fileName, file, {
      upsert: false,
      cacheControl: '3600',
    })

  if (storageError) throw new Error(storageError.message)

  // 2. Metadata'yı DB'ye kaydet
  const { error: dbError } = await supabase
    .from('posts')
    .insert([{
      user_id: user.id,
      file_path: storageData.path,
      location_point: coords ? `POINT(${coords.lng} ${coords.lat})` : null,
      captured_at: capturedAt || new Date().toISOString(),
    }])

  if (dbError) throw new Error(dbError.message)

  return storageData.path
}
