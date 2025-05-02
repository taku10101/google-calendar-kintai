export interface AttendanceRecord {
  id: string
  date: string
  title: string
  clockInTime: string
  clockOutTime: string | null
  workingHours: number
}

export interface BreakTime {
  startTime: string
  endTime: string
}
