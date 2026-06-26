export interface MeterRecord {
  date: string    // YYYY-MM-DD
  time: string    // HH:MM
  consumption: number  // kWh per 15-min interval
  feedIn: number
}

export interface MeterMetadata {
  customerName: string
  address: string
  contractNumber: string
  meterType: string
  meterCode: string
  meterNumber: string
}

export interface ParsedData {
  metadata: MeterMetadata
  records: MeterRecord[]
  fileName: string
}

export interface DailySummary {
  date: string         // YYYY-MM-DD
  label: string        // display label DD/MM
  total: number        // kWh
  peak15min: number    // highest single 15-min reading
  peakTime: string     // time of peak
  intervals: number    // number of 15-min readings
  weekday: string
}

export interface HourlyProfile {
  hour: number
  label: string        // "00:00", "01:00" …
  avgKwh: number       // average kWh for that hour across all days
  maxKwh: number
}

export interface WeekdayProfile {
  day: string          // Mon, Tue …
  dayIndex: number     // 0=Sun … 6=Sat
  avgDaily: number
}

export interface Analytics {
  totalKwh: number
  dateRange: { start: string; end: string }
  daysOfData: number
  averageDaily: number
  dailySummaries: DailySummary[]
  hourlyProfile: HourlyProfile[]
  weekdayProfile: WeekdayProfile[]
  peakDay: DailySummary
  peakHour: HourlyProfile
  quietHour: HourlyProfile
  topPeakDays: DailySummary[]
}
