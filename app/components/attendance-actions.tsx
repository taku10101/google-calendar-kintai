"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"
import ClockInDialog from "./clock-in-dialog"

interface AttendanceActionsProps {
  onClockIn: (title: string) => void
  onClockOut: () => void
}

export default function AttendanceActions({ onClockIn, onClockOut }: AttendanceActionsProps) {
  const [isClockInDialogOpen, setIsClockInDialogOpen] = useState(false)

  const handleClockInClick = () => {
    setIsClockInDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="flex items-center gap-2" onClick={handleClockInClick}>
          <LogIn className="h-4 w-4" />
          出勤
        </Button>
        <Button variant="default" className="flex items-center gap-2 bg-gray-800" onClick={onClockOut}>
          <LogOut className="h-4 w-4" />
          退勤
        </Button>
      </div>

      <ClockInDialog open={isClockInDialogOpen} onClose={() => setIsClockInDialogOpen(false)} onClockIn={onClockIn} />
    </>
  )
}
