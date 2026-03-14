import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Bugün çekim yapılıp yapılmadığını kontrol eder.
 * Build hatasını çözmek için eklendi.
 */
export const checkTodayCapture = async (): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('t')[0]; // YYYY-MM-DD
    
    // Not: Gerçek veritabanı tablon henüz hazır değilse 
    // şimdilik her zaman false dönebiliriz:
    // return false;

    const { data, error } = await supabase
      .from('moments')
      .select('id')
      .gte('created_at', today)
      .limit(1);

    if (error) return false;
    return data && data.length > 0;
  } catch (err) {
    return false;
  }
}

/**
 * Moment yükleme fonksiyonu (page.tsx'teki argümanlarla uyumlu hale getirildi)
 */
export const uploadMoment = async (file: File, location?: any, timestamp?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `one_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // 1. Storage'a dosyayı yükle
    const { data: storageData, error: storageError } = await supabase.storage
      .from('moments')
      .upload(fileName, file, { upsert: true });

    if (storageError) {
      alert("Yükleme Başarısız: " + storageError.message);
      return null;
    }

    // 2. Veritabanına meta verileri kaydet (location ve timestamp dahil)
    const { error: dbError } = await supabase
      .from('moments')
      .insert([
        { 
          file_path: storageData.path, 
          location: location || 'Unknown', 
          captured_at: timestamp || new Date().toISOString() 
        }
      ]);

    if (dbError) {
       console.warn("Meta data kaydedilemedi:", dbError.message);
    }

    alert("TEBRİKLER: Gerçeklik başarıyla kaydedildi!");
    return storageData.path;
  } catch (err: any) {
    alert("Sistem Hatası: " + err.message);
    return null;
  }
}
