'use client'
import { set, ref, onValue, update } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { projectDatabase } from '@/firebase/config'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [playerName, setPlayerName] = useState('')
  const [uniqueId, setUniqueId] = useState('')

  const handlePlayGame = () => {
    router.push(`/game?roomId=${room}`)
    const dataRef = ref(projectDatabase, `/${room}`)
    update(dataRef, { gameStarted: true })
  }
  const handleConfirmName = () => {
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
    set(dataRef, playerName)
    setPlayerName('')
  }

  useEffect(() => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    if (storedUniqueId) {
      setUniqueId(storedUniqueId)
    } else {
      const newUniqueId = uuidv4()
      setUniqueId(newUniqueId)
      localStorage.setItem('uniqueId', newUniqueId)
    }
    if (uniqueId !== '') {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Score`)
      set(dataRef, 0)
      const dataRef2 = ref(projectDatabase, `/${room}/gameStarted`)
      onValue(dataRef2, (snapshot) => {
        const data = snapshot.val()
        if (data) router.push(`/game?roomId=${room}`)
      })
    }
  })

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <input type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Enter your name" />
        <button onClick={handleConfirmName}>Confirm Name</button>
        <button onClick={handlePlayGame}>Play the game</button>
      </div>
    </main>
  )
}
