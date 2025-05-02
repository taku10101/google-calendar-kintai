"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AttendanceRecord } from "@/app/types/attendance"

interface EditRecordDialogProps {
  record: AttendanceRecord | null
  open: boolean
  onClose: () => void
  onSave: (record: AttendanceRecord) => void
}

export default function EditRecordDialog({ record, open, onClose, onSave }: EditRecordDialogProps) {
  const [editedRecord, setEditedRecord] = useState<AttendanceRecord | null>(record)

  // recordが変更されたら、editedRecordを更新
  useEffect(() => {
    setEditedRecord(record)
  }, [record])

  if (!record || !editedRecord) return null

  const handleInputChange = (field: keyof AttendanceRecord, value: string) => {
    setEditedRecord({
      ...editedRecord,
      [field]: value,
    })
  }

  const handleSave = () => {
    onSave(editedRecord)
  }

  // 日付をHTML input[type="date"]形式に変換
  const formatDateForInput = (dateStr: string) => {
    const [year, month, day] = dateStr.split("/")
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  // HTML input[type="date"]の値を元の形式に戻す
  const formatDateFromInput = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-")
    return `${year}/${month}/${day}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>勤怠記録の編集</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              日付
            </Label>
            <Input
              id="date"
              type="date"
              value={formatDateForInput(editedRecord.date)}
              onChange={(e) => handleInputChange("date", formatDateFromInput(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              value={editedRecord.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clockInTime" className="text-right">
              出勤時間
            </Label>
            <Input
              id="clockInTime"
              type="time"
              step="1"
              value={editedRecord.clockInTime}
              onChange={(e) => handleInputChange("clockInTime", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clockOutTime" className="text-right">
              退勤時間
            </Label>
            <Input
              id="clockOutTime"
              type="time"
              step="1"
              value={editedRecord.clockOutTime || ""}
              onChange={(e) => handleInputChange("clockOutTime", e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
