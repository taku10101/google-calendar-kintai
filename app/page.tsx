import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">勤怠管理システム</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/attendance" className="w-full">
          <Button className="w-full text-lg py-6">勤怠管理ページへ</Button>
        </Link>
      </div>
    </main>
  )
}
