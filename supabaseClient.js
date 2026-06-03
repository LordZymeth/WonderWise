import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xcajzwqytzhcdedfdkbw.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYWp6d3F5dHpoY2RlZGZka2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzcxODUsImV4cCI6MjA5NjA1MzE4NX0.L2m4IeRiAKBGcUPPSTOUkeSzvlSyk_0b59SxkrK-lsk"

export const supabase = createClient(supabaseUrl, supabaseKey)