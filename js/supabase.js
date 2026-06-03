/* ═══════════════════════════════════════════════════════
   Supabase Client Initialization
═══════════════════════════════════════════════════════ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.4/+esm';

// Initialize Supabase client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('destinations').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { connected: true, error: null };
  } catch (err) {
    console.error('Supabase connection error:', err);
    return { connected: false, error: err.message };
  }
}
