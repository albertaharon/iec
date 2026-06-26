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
  const path = `${timestamp}_${file.name}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false })

  if (error) {
    console.warn('Supabase upload failed (non-fatal):', error.message)
  }
}
