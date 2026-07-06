import { createClient } from '@supabase/supabase-js'

// Browser client (for client components)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

// Server client (for API routes — uses service role key, bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_to_prevent_client_evaluation_crash',
  { auth: { autoRefreshToken: false, persistSession: false } }
)
