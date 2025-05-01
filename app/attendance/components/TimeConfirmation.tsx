"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatTime, parseTimeString } from "../utils/timeUtils"

interface TimeConfirmationProps {
  checkinTime: string
  onConfirm: (checkoutTime: string) => void
  onCancel: () => void
}

export function TimeConfirmation({ checkinTime, onConfirm, onCancel }: TimeConfirmationProps) {
  const [checkoutTime, setCheckoutTime] = useState(formatTime(new Date()))
  const [workDuration, setWorkDuration] = useState("")

  useEffect(() => {
    calculateDuration()
  }, [checkoutTime])

  const calculateDuration = () => {
    try {
      const startTime = parseTimeString(checkinTime)
      const endTime = parseTimeString(checkoutTime)

      if (startTime && endTime) {
        const durationMs = endTime.getTime() - startTime.getTime()
        const hours = Math.floor(durationMs / (1000 * 60 * 60))
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))

        setWorkDuration(`${hours}時間${minutes}分`)
      }
    } catch (error) {
      setWorkDuration("計算エラー")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">退勤時間の確認</h2>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkin-time">出勤時間</Label>
              <Input id="checkin-time" value={checkinTime} disabled />
            </div>
            <div>
              <Label htmlFor="checkout-time">退勤時間</Label>
              <Input
                id="checkout-time"
                type="time"
                value={checkoutTime}
                onChange={(e) => setCheckoutTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>勤務時間</Label>
            <p className="p-2 border rounded bg-gray-50">{workDuration}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={() => onConfirm(checkoutTime)}>確定</Button>
        </div>
      </div>
    </div>
  )
}
