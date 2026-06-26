import Papa from 'papaparse'
import type { MeterMetadata, MeterRecord, ParsedData } from '../types'

// IEC CSV layout:
// row 0: empty
// row 1: header labels (customer name, address, contract)
// row 2: empty
// row 3: customer data
// row 4: empty
// row 5: meter type/code/number labels
// row 6: empty (6 cols)
// row 7: meter data
// row 8: separator line
// row 9: empty
// row 10: data column headers (contains "תאריך")
// row 11: empty
// row 12+: actual data records

function parseDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/')
  return `${yyyy}-${mm}-${dd}`
}

export function parseIECFile(csvText: string, fileName: string): ParsedData {
  const result = Papa.parse<string[]>(csvText, {
    skipEmptyLines: false,
    header: false,
  })

  const rows = result.data as string[][]

  // Extract metadata from fixed rows
  const customerRow = rows[3] ?? []
  const meterRow = rows[7] ?? []

  const metadata: MeterMetadata = {
    customerName: (customerRow[0] ?? '').trim(),
    address: (customerRow[1] ?? '').trim(),
    contractNumber: (customerRow[2] ?? '').trim(),
    meterType: (meterRow[0] ?? '').trim(),
    meterCode: (meterRow[1] ?? '').trim(),
    meterNumber: (meterRow[2] ?? '').trim(),
  }

  // Find the data header row by scanning for the row containing "תאריך"
  let dataStartIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row && row.some(cell => cell.includes('תאריך'))) {
      dataStartIdx = i + 2  // skip header row + blank row
      break
    }
  }

  if (dataStartIdx === -1) {
    throw new Error('Could not find data section in CSV. Is this an IEC export file?')
  }

  const MAX_RECORDS = 200_000 // ~34 years of 15-min data
  const records: MeterRecord[] = []

  for (let i = dataStartIdx; i < rows.length; i++) {
    if (records.length >= MAX_RECORDS) break

    const row = rows[i]
    if (!row || row.length < 5) continue

    const dateStr = (row[2] ?? '').trim()
    const timeStr = (row[3] ?? '').trim()
    const consumptionStr = (row[4] ?? '').toString().trim()
    const feedInStr = (row[5] ?? '').toString().trim()

    if (!dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/) || !timeStr.match(/^\d{2}:\d{2}$/)) continue

    const rawConsumption = parseFloat(consumptionStr)
    const rawFeedIn = parseFloat(feedInStr)
    // Reject NaN/Infinity and negative values; cap at 1000 kWh per interval (far above any real meter)
    const consumption = isFinite(rawConsumption) ? Math.min(Math.max(0, rawConsumption), 1000) : 0
    const feedIn = isFinite(rawFeedIn) ? Math.min(Math.max(0, rawFeedIn), 1000) : 0

    records.push({
      date: parseDate(dateStr),
      time: timeStr,
      consumption,
      feedIn,
    })
  }

  if (records.length === 0) {
    throw new Error('No valid data records found in file.')
  }

  return { metadata, records, fileName }
}
