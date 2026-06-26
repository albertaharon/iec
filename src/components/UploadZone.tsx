import { useCallback, useState } from 'react'
import type { ParsedData } from '../types'
import { parseIECFile } from '../lib/parseIEC'
import { archiveUpload } from '../lib/supabase'

interface Props {
  onParsed: (data: ParsedData) => void
}

export default function UploadZone({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

  const processFile = useCallback(async (file: File) => {
    const allowedMime = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel', '']
    if (!file.name.endsWith('.csv') || (!allowedMime.includes(file.type) && file.type !== '')) {
      setError('אנא העלה קובץ CSV שיוצא מאתר חברת החשמל.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`הקובץ גדול מדי (${(file.size / 1024 / 1024).toFixed(1)} MB). הגודל המקסימלי הוא 10 MB.`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = parseIECFile(text, file.name)
      void archiveUpload(file)
      onParsed(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בעיבוד הקובץ.')
    } finally {
      setLoading(false)
    }
  }, [onParsed])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void processFile(file)
  }, [processFile])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void processFile(file)
  }, [processFile])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4
                    bg-gray-50 dark:bg-slate-950">
      {/* Logo / title */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          צריכת חשמל
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-lg">
          העלה את קובץ ייצוא המונה מחברת החשמל ולצפות בניתוח הצריכה שלך
        </p>
      </div>

      {/* Drop zone */}
      <label
        htmlFor="csv-input"
        className={`
          relative w-full max-w-lg rounded-2xl border-2 border-dashed cursor-pointer
          flex flex-col items-center justify-center gap-4 py-16 px-8
          transition-all duration-200
          ${dragging
            ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 scale-105'
            : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-cyan-500 hover:bg-gray-50 dark:hover:bg-slate-800/60'
          }
        `}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={onInputChange}
        />

        {loading ? (
          <>
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
            <p className="text-gray-700 dark:text-slate-300 text-lg">מעבד את הנתונים…</p>
          </>
        ) : (
          <>
            <div className="text-5xl">📂</div>
            <div className="text-center">
              <p className="text-gray-800 dark:text-slate-200 text-lg font-medium">
                גרור לכאן את קובץ ה-CSV
              </p>
              <p className="text-gray-500 dark:text-slate-400 mt-1">או לחץ לבחירה</p>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-500
                             bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              ייצוא מונה חכם מחברת החשמל (.csv)
            </span>
          </>
        )}
      </label>

      {error && (
        <div className="mt-6 w-full max-w-lg bg-red-50 dark:bg-red-950/60
                        border border-red-300 dark:border-red-700
                        text-red-700 dark:text-red-300 rounded-xl px-5 py-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <p className="mt-6 text-gray-400 dark:text-slate-500 text-xs text-center">
        הקובץ מעובד מקומית בדפדפן שלך · עותק מועלה לבעל האתר לצרכי ניפוי שגיאות
      </p>
    </div>
  )
}
