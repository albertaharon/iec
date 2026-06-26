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

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file exported from the IEC website.')
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
      setError(e instanceof Error ? e.message : 'Failed to parse file.')
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo / title */}
      <div className="mb-10 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-4xl font-bold text-white mb-2">Electricity Dashboard</h1>
        <p className="text-slate-400 text-lg">
          Upload your IEC meter export to see your usage insights
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
            ? 'border-cyan-400 bg-cyan-950/40 scale-105'
            : 'border-slate-600 bg-slate-900 hover:border-cyan-500 hover:bg-slate-800/60'
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
            <p className="text-slate-300 text-lg">Parsing your data…</p>
          </>
        ) : (
          <>
            <div className="text-5xl">📂</div>
            <div className="text-center">
              <p className="text-slate-200 text-lg font-medium">
                Drop your CSV file here
              </p>
              <p className="text-slate-400 mt-1">or click to browse</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
              IEC smart meter export (.csv)
            </span>
          </>
        )}
      </label>

      {error && (
        <div className="mt-6 w-full max-w-lg bg-red-950/60 border border-red-700 text-red-300 rounded-xl px-5 py-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-10 w-full max-w-lg bg-slate-900/60 rounded-xl p-5 border border-slate-800">
        <h3 className="text-slate-300 font-semibold mb-3 text-sm uppercase tracking-wide">
          How to export from IEC
        </h3>
        <ol className="text-slate-400 text-sm space-y-1.5 list-decimal list-inside">
          <li>Log in to <span className="text-slate-300">https://www.iec.co.il</span></li>
          <li>Go to <span className="text-slate-300">My Account → Meter Readings</span></li>
          <li>Select date range and download as CSV</li>
          <li>Upload the file here</li>
        </ol>
        <p className="mt-3 text-slate-500 text-xs">
          Your file is processed locally and a copy is archived for the site owner.
        </p>
      </div>
    </div>
  )
}
