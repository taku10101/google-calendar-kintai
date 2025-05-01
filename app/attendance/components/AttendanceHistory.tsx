"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { AttendanceRecord } from "../types/attendance"
import { formatDate } from "../utils/timeUtils"

interface AttendanceHistoryProps {
  attendanceHistory: AttendanceRecord[]
  isLoading: boolean
}

export function AttendanceHistory({ attendanceHistory, isLoading }: AttendanceHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center py-8">読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  if (attendanceHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center py-8">勤怠記録がありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">日付</th>
                <th className="px-4 py-3 text-left">タイトル</th>
                <th className="px-4 py-3 text-left">出勤</th>
                <th className="px-4 py-3 text-left">退勤</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((record, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-3">{formatDate(record.date)}</td>
                  <td className="px-4 py-3">{record.title}</td>
                  <td className="px-4 py-3">{record.checkinTime}</td>
                  <td className="px-4 py-3">
                    {record.checkoutTime || <span className="text-green-600 font-medium">勤務中</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
