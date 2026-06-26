import { useState } from 'react'
import type { ParsedData } from './types'
import UploadZone from './components/UploadZone'
import Dashboard from './components/Dashboard'

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  return (
    <div className="min-h-screen">
      {parsedData ? (
        <Dashboard
          data={parsedData}
          onReset={() => setParsedData(null)}
        />
      ) : (
        <UploadZone onParsed={setParsedData} />
      )}
    </div>
  )
}
