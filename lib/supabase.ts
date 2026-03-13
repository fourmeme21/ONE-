import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const uploadMoment = async (file: File) => {
  try {
    const fileName = `${Date.now()}-${file.name}`
    
    const { data, error } = await supabase.storage
      .from('moments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      // Hatayı direkt ekranda görelim
      alert("Supabase Hatası: " + error.message)
      console.error('Yükleme hatası:', error)
      return null
    }

    console.log('Yükleme başarılı:', data)
    return data.path
  } catch (err: any) {
    alert("Bağlantı Hatası: " + err.message)
    return null
  }
}
