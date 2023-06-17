'use client'
import { set, ref, onValue, update, off, onDisconnect } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [playerName, setPlayerName] = useState('')
  const [uniqueId, setUniqueId] = useState('')
  const [readNames, setReadNames] = useState<string[]>([])
  const handlePlayGame = () => {
    router.push(`/game?roomId=${room}`)
    const dataRef = ref(projectDatabase, `/${room}`)
    update(dataRef, { gameStarted: true })
  }
  const [inputName, setInputName] = useState('')

  const handleConfirmName = () => {
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
    set(dataRef, inputName)

    setPlayerName(inputName)
    setInputName('')
  }
  const [copySuccess, setCopySuccess] = useState('')
  async function handleCopyLink() {
    await navigator.clipboard.writeText(location.href)
    setCopySuccess('Copied')
  }
  let otherPlayerIds: Array<string>
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
      // Set up onDisconnect event listener
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()
      const dataRef2 = ref(projectDatabase, `/${room}/gameStarted`)
      onValue(dataRef2, (snapshot) => {
        const data = snapshot.val()
        if (data) router.push(`/game?roomId=${room}`)
      })
      const playersRef = ref(projectDatabase, `/${room}`)
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        console.log(data)

        if (data) {
          const playerIds = Object.keys(data)
          //otherPlayerIds = playerIds.filter((id) => id !== localStorage.getItem('uniqueId'))
          playerIds.forEach((otherId) => {
            const dataRef3 = ref(projectDatabase, `/${room}/${otherId}`)

            const listener = onValue(dataRef3, (snapshot) => {
              const data: { Name: string } = snapshot.val()
              if (data && data.Name) {
                const nameData = data.Name
                setReadNames((prevReadNames) => ({
                  ...prevReadNames,
                  [otherId]: nameData,
                }))
              }
            })
          })
        }
      })
    }
    return () => {
      const dataRef2 = ref(projectDatabase, `/${room}/gameStarted`)
      off(dataRef2)

      const playersRef = ref(projectDatabase, `/${room}`)
      off(playersRef)

      // Állítólag nem jó az off
    }
  }, [uniqueId, room])
  const [placeHolders, setPlaceHolders] = useState<any[]>([])
  useEffect(() => {
    setPlaceHolders(
      Array.from({ length: 6 - Object.keys(readNames).length }).map((_, index) => (
        <div key={`placeholder-${index}`} className="ml-4 py-2 mt-2 px-8 rounded-lg border-2 border-white opacity-50">
          Player
        </div>
      )),
    )
  }, [readNames])

  return (
    <main className="flex h-screen flex-col items-center justify-center text-white">
      <div className="bg-[#170e2ea3] text-xl mb-20 rounded-lg h-3/4 w-1/2 flex flex-col items-center justify-center gap-10">
        <button className="px-16 rounded-md py-5 text-2xl bg-[#CFCEFB] text-black" onClick={handleCopyLink}>
          Copy link
        </button>
        <div className="flex">
          <Image src="/pain.jpeg" alt="dropped" width={50} height={50} className="w-32 h-32 " />
          <div className="flex flex-col ml-8">
            Choose a name and an avatar
            <div className="mt-4">
              <input className="text-lg rounded-lg" type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Your name" />
              <button className="px-4 ml-4 rounded-md py-1 text-lg bg-[#EFCEFB] text-black" onClick={handleConfirmName}>
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="grid h-auto w-auto grid-cols-2 grid-rows-3">
          {Object.entries(readNames).map(([playerId, name]) => (
            <div key={playerId} className="ml-4 py-2 px-8 rounded-lg border-2 border-white">
              {name === playerName ? name + ' (you)' : name}
            </div>
          ))}
          {placeHolders}
        </div>
        <button className="px-16 rounded-md py-5 text-2xl bg-[#EFCEFB] text-black" onClick={handlePlayGame}>
          Start game
        </button>
      </div>
    </main>
  )
}
