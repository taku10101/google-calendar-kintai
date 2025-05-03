"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { AttendanceRecord } from "@/app/types/attendance"
import { calculateWorkingHours } from "@/app/utils/time-calculator"

export function useAttendanceData() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedRecords = localStorage.getItem("attendanceRecords")
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords))
    }
  }, [])

  // データが変更されたらLocalStorageに保存
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      localStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords))
    }
  }, [attendanceRecords])

  // 現在の日付を取得
  const getCurrentDateString = () => {
    const now = new Date()
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`
  }

  // 現在の時間を取得
  const getCurrentTimeString = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
  }

  // 出勤
  const clockIn = (title: string) => {
    const dateStr = getCurrentDateString()
    const timeStr = getCurrentTimeString()

    // 同じ日の記録があるか確認
    const existingRecord = attendanceRecords.find((record) => record.date === dateStr && !record.clockOutTime)

    if (existingRecord) {
      // すでに出勤済みの場合は何もしない
      return
    }

    const newRecord: AttendanceRecord = {
      id: uuidv4(),
      date: dateStr,
      title: title,
      clockInTime: timeStr,
      clockOutTime: null,
      workingHours: 0,
    }

    setAttendanceRecords([...attendanceRecords, newRecord])
    setCurrentRecord(newRecord)
  }

  // 退勤
  const clockOut = () => {
    if (!currentRecord) {
      // 出勤記録がない場合は何もしない
      return
    }

    const timeStr = getCurrentTimeString()

    const updatedRecord = {
      ...currentRecord,
      clockOutTime: timeStr,
    }

    // 勤務時間を計算
    const workingHours = calculateWorkingHours(updatedRecord.clockInTime, updatedRecord.clockOutTime as string)

    updatedRecord.workingHours = workingHours

    // 記録を更新
    setAttendanceRecords(attendanceRecords.map((record) => (record.id === currentRecord.id ? updatedRecord : record)))

    setCurrentRecord(null)
  }

  // 記録を更新
  const updateRecord = (updatedRecord: AttendanceRecord) => {
    // 勤務時間を再計算
    if (updatedRecord.clockInTime && updatedRecord.clockOutTime) {
      updatedRecord.workingHours = calculateWorkingHours(updatedRecord.clockInTime, updatedRecord.clockOutTime)
    }

    setAttendanceRecords(attendanceRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)))
  }

  return {
    attendanceRecords,
    currentMonth,
    setCurrentMonth,
    clockIn,
    clockOut,
    updateRecord,
  }
}
