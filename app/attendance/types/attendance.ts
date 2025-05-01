export interface AttendanceRecord {
  id?: string
  date: string
  title: string
  checkinTime: string
  checkoutTime?: string
  eventId?: string
}
