"use client"

import { useState, useEffect } from "react"
import type { AttendanceRecord } from "../types/attendance"
import { fetchAttendanceRecords, recordCheckIn, recordCheckOut } from "../utils/gasApi"

export function useAttendance() {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAttendanceRecords()
  }, [])

  const loadAttendanceRecords = async () => {
    try {
      setIsLoading(true)
      const records = await fetchAttendanceRecords()
      setAttendanceHistory(records)
    } catch (error) {
      console.error("Failed to load attendance records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkIn = async (title: string) => {
    try {
      setIsLoading(true)
      await recordCheckIn(title)
      await loadAttendanceRecords()
    } catch (error) {
      console.error("Failed to check in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkOut = async (title: string, checkoutTime: string, eventId: string) => {
    try {
      setIsLoading(true)
      await recordCheckOut(title, checkoutTime, eventId)
      await loadAttendanceRecords()
    } catch (error) {
      console.error("Failed to check out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateCheckoutTime = async (recordId: string, checkoutTime: string) => {
    try {
      setIsLoading(true)
      // GAS APIを使用して退勤時間を更新する処理を実装
      await loadAttendanceRecords()
    } catch (error) {
      console.error("Failed to update checkout time:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    attendanceHistory,
    isLoading,
    checkIn,
    checkOut,
    updateCheckoutTime,
    refreshRecords: loadAttendanceRecords,
  }
}
