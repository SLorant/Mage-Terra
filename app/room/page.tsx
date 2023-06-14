'use client'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')

  const handlePlayGame = () => {
    router.push(`/game?roomId=${room}`)
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <button onClick={handlePlayGame}>Play the game</button>
      </div>
    </main>
  )
}
