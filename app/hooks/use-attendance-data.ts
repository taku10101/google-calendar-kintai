"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import type { AttendanceRecord } from "@/app/types/attendance"
import { calculateWorkingHours } from "@/app/utils/time-calculator"

export function useAttendanceData() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null)

  // 月ごとのキーを生成
  const getMonthKey = (date: Date) => {
    return `attendanceRecords-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }

  // LocalStorageからデータを読み込む（月ごと）
  useEffect(() => {
    const key = getMonthKey(currentMonth)
    const savedRecords = localStorage.getItem(key)
    if (savedRecords) {
      setAttendanceRecords(JSON.parse(savedRecords))
    } else {
      setAttendanceRecords([])
    }
  }, [currentMonth])

  // データが変更されたらLocalStorageに保存（月ごと）
  useEffect(() => {
    const key = getMonthKey(currentMonth)
    localStorage.setItem(key, JSON.stringify(attendanceRecords))
  }, [attendanceRecords, currentMonth])

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
    setAttendanceRecords,
  }
}
