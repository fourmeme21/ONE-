import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadMoment = async (file: File) => {
  try {
    // Dosya adını temizleyelim: Sadece rakam ve .jpg gibi uzantı kalsın
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('moments')
      .upload(fileName, file, {
        upsert: true // Eğer aynı isimde dosya varsa üzerine yaz (hata vermez)
      });

    if (error) {
      alert("Yükleme Başarısız: " + error.message);
      return null;
    }

    alert("TEBRİKLER: Fotoğraf başarıyla Supabase'e yüklendi!");
    return data.path;
  } catch (err: any) {
    alert("Sistem Hatası: " + err.message);
    return null;
  }
}
