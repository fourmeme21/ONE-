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
    // Standard ISO format is YYYY-MM-DDTHH:mm:ss.sssZ. We split at 'T' for the date.
    const today = new Date().toISOString().split('T')[0]; 
    
    const { data, error } = await supabase
      .from('posts') // Table name changed from moments to posts
      .select('id')
      .gte('created_at', today)
      .limit(1);

    if (error) {
      console.error("Fetch Error:", error.message);
      return false;
    }
    
    return data && data.length > 0;
  } catch (err) {
    console.error("System Check Error:", err);
    return false;
  }
}

/**
 * Uploads the captured reality (file) to Storage (posts bucket) 
 * and saves metadata to the Database (posts table).
 * Consistent with arguments used in app/page.tsx
 */
export const uploadMoment = async (file: File, location?: any, timestamp?: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `one_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // 1. Upload the file to Supabase Storage 'posts' bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('posts') // Bucket name is posts
      .upload(fileName, file, { 
        upsert: true,
        cacheControl: '3600'
      });

    if (storageError) {
      alert("Upload Failed: " + storageError.message);
      return null;
    }

    // 2. Save metadata (path, location, timestamp) to the 'posts' table
    const { error: dbError } = await supabase
      .from('posts') // Table name changed from moments to posts
      .insert([
        { 
          file_path: storageData.path, 
          location: location || 'Unknown', 
          captured_at: timestamp || new Date().toISOString() 
        }
      ]);

    if (dbError) {
       console.warn("Metadata sync failed:", dbError.message);
       // Note: We don't block the user if only DB metadata fails, 
       // but it's logged for maintenance since the file is already in storage.
    }

    alert("CONGRATS: Your reality has been captured successfully!");
    return storageData.path;
  } catch (err: any) {
    alert("System Error: " + err.message);
    return null;
  }
}
