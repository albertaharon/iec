import { useState } from 'react'
import type { ParsedData } from './types'
import { computeAnalytics } from './lib/analytics'
import UploadZone from './components/UploadZone'
import Dashboard from './components/Dashboard'

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)

  const analytics = parsedData ? computeAnalytics(parsedData.records) : null

  return (
    <div className="min-h-screen">
      {parsedData && analytics ? (
        <Dashboard
          data={parsedData}
          analytics={analytics}
          onReset={() => setParsedData(null)}
        />
      ) : (
        <UploadZone onParsed={setParsedData} />
      )}
    </div>
  )
}
