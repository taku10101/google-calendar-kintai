"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface AttendanceFormProps {
  onCheckIn: (title: string) => void
  onCheckOut: (title: string) => void
  isLoading: boolean
}

export function AttendanceForm({ onCheckIn, onCheckOut, isLoading }: AttendanceFormProps) {
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")

  const handleCheckIn = () => {
    if (!title.trim()) {
      setError("タイトルを入力してください")
      return
    }
    setError("")
    onCheckIn(title)
  }

  const handleCheckOut = () => {
    if (!title.trim()) {
      setError("タイトルを入力してください")
      return
    }
    setError("")
    onCheckOut(title)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル（業務内容）</Label>
            <Input
              id="title"
              placeholder="例: プロジェクトA 開発作業"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button onClick={handleCheckIn} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              出勤
            </Button>
            <Button onClick={handleCheckOut} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700">
              退勤
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
