import { useState, useEffect } from 'react'
import type { ParsedData } from './types'
import UploadZone from './components/UploadZone'
import Dashboard from './components/Dashboard'

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <div className="min-h-screen">
      {/* Floating theme toggle */}
      <button
        onClick={() => setIsDark(d => !d)}
        className="fixed bottom-5 left-5 z-50 w-10 h-10 rounded-full
                   bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                   shadow-lg hover:shadow-xl transition-all text-xl
                   flex items-center justify-center"
        title={isDark ? 'מצב יום' : 'מצב לילה'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {parsedData ? (
        <Dashboard
          data={parsedData}
          isDark={isDark}
          onReset={() => setParsedData(null)}
        />
      ) : (
        <UploadZone onParsed={setParsedData} />
      )}
    </div>
  )
}
