import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbkaeuaytqfhxmnaqtej.supabase.co';
const supabaseAnonKey = 'sb_publishable_tT0mWOZiarHYWbFstuuFag_7txsMRvh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false, // Sem AsyncStorage por enquanto, apenas login em memória
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});
