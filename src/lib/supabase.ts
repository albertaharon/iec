import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = supabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

export const BUCKET = 'iec-uploads'

export async function archiveUpload(file: File): Promise<void> {
  if (!supabase) return

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  // Strip path traversal and non-safe characters from the filename
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_')
  const path = `${timestamp}_${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    console.warn('Supabase upload failed (non-fatal):', error.message)
  }
}
