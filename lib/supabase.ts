import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tyvezabojerfaxyctohm.supabase.co'
const supabaseAnonKey = 'sb_publishable_1JoS_on8letn0YwSIhZMKA_l1F_f-b2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
