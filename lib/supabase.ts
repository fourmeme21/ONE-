import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Checks if the user has already captured their moment for today.
 * Essential for enforcing the "One Moment Per Day" rule.
 */
export const checkTodayCapture = async (): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; 
    
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .gte('created_at', today)
      .limit(1);

    if (error) {
      console.error("Fetch Error:", error.message);
      return false;
    }
    
    return !!data && data.length > 0;
  } catch (err) {
    console.error("System Check Error:", err);
    return false;
  }
}

/**
 * Uploads the captured reality to Storage (posts bucket) 
 * and saves metadata to the Database (posts table).
 * Integrated with Layered Engine requirements (Geo-tagging).
 */
export const uploadMoment = async (file: File, coords?: { lat: number, lng: number }, locationName?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `one_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // 1. Upload the file to Supabase Storage 'posts' bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('posts')
      .upload(fileName, file, { 
        upsert: true,
        cacheControl: '3600'
      });

    if (storageError) {
      throw new Error(storageError.message);
    }

    // 2. Save metadata with Geo-tagging support for Radius Layer (50km)
    const { error: dbError } = await supabase
      .from('posts')
      .insert([
        { 
          file_path: storageData.path, 
          location_name: locationName || 'Unknown',
          // PostGIS POINT format: POINT(longitude latitude)
          location_point: coords ? `POINT(${coords.lng} ${coords.lat})` : null,
          captured_at: new Date().toISOString() 
        }
      ]);

    if (dbError) {
      throw new Error(dbError.message);
    }

    return storageData.path;
  } catch (err: any) {
    throw err;
  }
}
