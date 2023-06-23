'use client'
import { set, ref, onValue, update, off, onDisconnect, remove } from 'firebase/database'
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
  const [hostExists, setHostExists] = useState(false)
  const [readNames, setReadNames] = useState<{ [key: string]: string }>({})
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
  async function handleCopyLink() {
    await navigator.clipboard.writeText(location.href)
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
    setReadNames({})
    if (uniqueId !== '') {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Score`)
      set(dataRef, 0)
      // Set up onDisconnect event listener
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      if (playerName === '') {
        setPlayerName('New player')
        setReadNames((prevReadNames) => ({
          ...prevReadNames,
          [uniqueId]: 'New player',
        }))
        const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
        set(dataRef, 'New player')
      }
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()

      /*  const connectedRef = ref(projectDatabase, '.info/connected')
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          console.log('connected')
        } else {
          //setReadNames({})
        }
      }) */

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
          if (playerIds.length === 1) {
            const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Host`)
            set(dataRef, true)
            setHostExists(true)
          } else setHostExists(false)
          playerIds.forEach((otherId) => {
            const dataRef3 = ref(projectDatabase, `/${room}/${otherId}`)
            onValue(dataRef3, (snapshot) => {
              const data: { Name: string; Host: boolean } = snapshot.val()
              if (data && data.Name) {
                const nameData = data.Name
                setReadNames((prevReadNames) => ({
                  ...prevReadNames,
                  [otherId]: nameData,
                }))
              }
              if (data && data.Host) {
                setHostExists(true)
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
        <div key={`placeholder-${index}`} className="ml-4 py-2 mt-2 px-8 rounded-lg border-2 border-white opacity-50"></div>
      )),
    )
  }, [readNames])
  useEffect(() => {
    if (hostExists === false) {
      const IdArray = Object.keys(readNames)
      //const randomIndex = Math.floor(Math.random() * IdArray.length)
      console.log(IdArray[0])
      const dataRef = ref(projectDatabase, `/${room}/${IdArray[1]}/Host`)
      set(dataRef, true)
      setHostExists(true)
    }
  }, [hostExists])
  console.log(Object.keys(readNames))
  return (
    <main className="flex h-screen flex-col items-center justify-center text-white font-sans">
      <div className="bg-[#170e2ea3] text-xl mb-20 rounded-lg h-[700px] w-[700px] flex flex-col items-center justify-center gap-10">
        <button className="px-16 rounded-md py-5 text-2xl bg-[#CFCEFB] text-black" onClick={handleCopyLink}>
          Copy link
        </button>
        <div className="flex">
          <Image src="/avatars-04.png" alt="dropped" width={100} height={100} className="w-36 h-40 " unoptimized />
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
              {name === playerName && playerId === uniqueId && name === 'New player'
                ? 'You'
                : name === playerName && playerId === uniqueId
                ? name + ' (you)'
                : name}

              {/*  {name === playerName && playerId === uniqueId ? name + ' (you)' : name} */}
              {name === 'New player' && <span className="ml-8">...</span>}
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
