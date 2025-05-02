import AttendanceTracker from "@/app/components/attendance-tracker"

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">勤怠管理ダッシュボード</h1>
      <AttendanceTracker />
    </main>
  )
}
