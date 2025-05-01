"use client"

import { useState } from "react"
import { AttendanceForm } from "./components/AttendanceForm"
import { TimeConfirmation } from "./components/TimeConfirmation"
import { AttendanceHistory } from "./components/AttendanceHistory"
import { useAttendance } from "./hooks/useAttendance"

export default function AttendancePage() {
  const [showTimeConfirmation, setShowTimeConfirmation] = useState(false)
  const [checkoutData, setCheckoutData] = useState<{
    title: string
    checkinTime: string
    eventId: string
  } | null>(null)

  const { attendanceHistory, isLoading, checkIn, checkOut, updateCheckoutTime } = useAttendance()

  const handleCheckIn = async (title: string) => {
    await checkIn(title)
  }

  const handleCheckOut = async (title: string) => {
    const activeRecord = attendanceHistory.find((record) => record.title === title && !record.checkoutTime)

    if (activeRecord) {
      setCheckoutData({
        title,
        checkinTime: activeRecord.checkinTime,
        eventId: activeRecord.eventId || "",
      })
      setShowTimeConfirmation(true)
    }
  }

  const handleConfirmCheckout = async (checkoutTime: string) => {
    if (checkoutData) {
      await checkOut(checkoutData.title, checkoutTime, checkoutData.eventId)
      setShowTimeConfirmation(false)
      setCheckoutData(null)
    }
  }

  const handleCancelCheckout = () => {
    setShowTimeConfirmation(false)
    setCheckoutData(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">勤怠管理</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">勤怠登録</h2>
          <AttendanceForm onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} isLoading={isLoading} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">勤怠履歴</h2>
          <AttendanceHistory attendanceHistory={attendanceHistory} isLoading={isLoading} />
        </div>
      </div>

      {showTimeConfirmation && checkoutData && (
        <TimeConfirmation
          checkinTime={checkoutData.checkinTime}
          onConfirm={handleConfirmCheckout}
          onCancel={handleCancelCheckout}
        />
      )}
    </div>
  )
}
