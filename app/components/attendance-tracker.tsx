"use client"
import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import AttendanceActions from "./attendance-actions"
import AttendanceTable from "./attendance-table"
import EditRecordDialog from "./edit-record-dialog"
import { useAttendanceData } from "@/app/hooks/use-attendance-data"
import { exportToICalendar } from "@/app/utils/ical-export"
import { importFromICalendar } from "@/app/utils/ical-import"
import type { AttendanceRecord } from "@/app/types/attendance"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AttendanceTracker() {
  const { attendanceRecords, currentMonth, setCurrentMonth, clockIn, clockOut, updateRecord, setAttendanceRecords } = useAttendanceData()
  const [hourlyRate, setHourlyRate] = useState(2500) // デフォルト時給2500円

  // 編集用の状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [recordToEdit, setRecordToEdit] = useState<AttendanceRecord | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleExportIcal = () => {
    exportToICalendar(attendanceRecords)
  }

  // 編集ダイアログを開く
  const handleEdit = (id: string) => {
    const record = attendanceRecords.find((record) => record.id === id)
    if (record) {
      setRecordToEdit(record)
      setIsEditDialogOpen(true)
    }
  }

  // 編集内容を保存
  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    updateRecord(updatedRecord)
    setIsEditDialogOpen(false)
    setRecordToEdit(null)
  }

  // 編集をキャンセル
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setRecordToEdit(null)
  }

  // iCalインポート処理
  const handleImportIcal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const importedRecords = await importFromICalendar(text)
      // 既存の勤怠記録とマージ（重複IDは上書き）
      const merged = [...attendanceRecords]
      importedRecords.forEach((rec) => {
        const idx = merged.findIndex((r) => r.id === rec.id)
        if (idx >= 0) {
          merged[idx] = rec
        } else {
          merged.push(rec)
        }
      })
      setAttendanceRecords(merged)
    } catch (err) {
      setImportError("インポートに失敗しました。ファイル形式を確認してください。")
    }
  }

  const formattedMonth = format(currentMonth, "yyyy年MM月", { locale: ja })

  // 現在の月のレコードをフィルタリング
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.date.replace(/\//g, "-"))
    return recordDate.getMonth() === currentMonth.getMonth() && recordDate.getFullYear() === currentMonth.getFullYear()
  })

  // 合計稼働時間を計算
  const totalWorkingHours = filteredRecords.reduce((total, record) => total + record.workingHours, 0)

  // 合計給与を計算
  const totalSalary = totalWorkingHours * hourlyRate

  // 削除処理
  const handleDelete = (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      setAttendanceRecords(attendanceRecords.filter((record) => record.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>勤怠アクション</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceActions onClockIn={clockIn} onClockOut={clockOut} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>勤怠記録</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{formattedMonth}</span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceTable records={filteredRecords} onEdit={handleEdit} onDelete={handleDelete} />
          <div className="mt-4 flex gap-2 items-center">
            <Button variant="outline" onClick={handleExportIcal} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              iCalでエクスポート
            </Button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".ics,text/calendar"
                onChange={handleImportIcal}
                style={{ display: "none" }}
              />
              <Button asChild variant="outline" className="flex items-center gap-2">
                <span>iCalでインポート</span>
              </Button>
            </label>
            {importError && <span className="text-red-500 text-sm">{importError}</span>}
          </div>
        </CardContent>
      </Card>

      {/* 合計稼働時間と給与計算 */}
      <Card>
        <CardHeader>
          <CardTitle>稼働時間と給与計算</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hourlyRate">時給 (円)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={hourlyRate}
                  min={0}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                />
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">合計稼働時間</div>
                <div className="text-2xl font-bold">{Math.floor(totalWorkingHours)}時間</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">合計給与 (概算)</div>
                <div className="text-2xl font-bold">{Math.floor(totalSalary).toLocaleString()}円</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      <EditRecordDialog
        record={recordToEdit}
        open={isEditDialogOpen}
        onClose={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
