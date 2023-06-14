'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ref, set } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import { projectDatabase } from '@/firebase/config'

export default function Home() {
  const router = useRouter()
  const [uniqueId, setUniqueId] = useState('')

  const handlePlayGame = () => {
    const newUniqueId = uuidv4() // Generate a unique ID
    setUniqueId(newUniqueId) // Update the state with the generated ID

    // Update the realtime database with the unique ID
    const dbRef = ref(projectDatabase, `/vmi/${newUniqueId}`)
    set(dbRef, {
      Board: {
        /* Initial board data */
      },
    })
      .then(() => {
        console.log('Data written successfully.')
        // Redirect the user to the game page with the unique ID as a query parameter
        router.push(`/room?roomId=${newUniqueId}`)
      })
      .catch((error) => {
        console.error('Error writing data:', error)
      })
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <button onClick={handlePlayGame}>Play the game</button>
      </div>
    </main>
  )
}
