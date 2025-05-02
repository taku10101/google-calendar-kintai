"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ClockInDialogProps {
  open: boolean
  onClose: () => void
  onClockIn: (title: string) => void
}

export default function ClockInDialog({ open, onClose, onClockIn }: ClockInDialogProps) {
  const [title, setTitle] = useState("")

  const handleClockIn = () => {
    onClockIn(title)
    setTitle("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>出勤登録</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              タイトル
            </Label>
            <Input
              id="title"
              placeholder="業務内容や案件名を入力"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleClockIn}>出勤</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
