"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AttendanceRecord } from "@/app/types/attendance"
import { formatTime, formatDuration } from "@/app/utils/time-formatter"

interface AttendanceTableProps {
  records: AttendanceRecord[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function AttendanceTable({ records, onEdit, onDelete }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>タイトル</TableHead>
            <TableHead>出勤時間</TableHead>
            <TableHead>退勤時間</TableHead>
            <TableHead>勤務時間</TableHead>
            <TableHead className="text-right">編集</TableHead>
            <TableHead className="text-right">削除</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                記録がありません
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.title || "-"}</TableCell>
                <TableCell>{formatTime(record.clockInTime)}</TableCell>
                <TableCell>{formatTime(record.clockOutTime)}</TableCell>
                <TableCell>{formatDuration(record.workingHours)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(record.id)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">編集</span>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDelete(record.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">削除</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
