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
  const [hostId, setHostId] = useState('')
  const [currentPlayers, setCurrentPlayers] = useState(100)
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
    if (uniqueId === '') {
      let storedUniqueId = localStorage.getItem('uniqueId')
      if (storedUniqueId) {
        setUniqueId(storedUniqueId)
      } else {
        const newUniqueId = uuidv4()
        setUniqueId(newUniqueId)
        localStorage.setItem('uniqueId', newUniqueId)
      }
    }
  }, [])
  useEffect(() => {
    if (uniqueId !== '') {
      const dataRef2 = ref(projectDatabase, `/${room}/gameStarted`)
      onValue(dataRef2, (snapshot) => {
        const data = snapshot.val()
        if (data) router.push(`/game?roomId=${room}`)
      })
      const playersRef = ref(projectDatabase, `/${room}`)
      onValue(playersRef, (snapshot) => {
        const data: { Host: string } = snapshot.val()
        if (data) {
          const elements = Object.keys(data)
          const playerIds = elements.filter((id) => id !== 'Host')
          if (data && data.Host && data.Host.length > 0) {
            setHostId(data.Host)
          }
          if (playerIds.length === 1) {
            const dataRef = ref(projectDatabase, `/${room}/Host`)
            set(dataRef, uniqueId)
            setHostId(uniqueId)
          } else if (data.Host === undefined) {
            const dataRef = ref(projectDatabase, `/${room}/Host`)
            set(dataRef, uniqueId)
            setHostId(uniqueId)
          }
          setReadNames({})
          playerIds.forEach((otherId) => {
            const dataRef3 = ref(projectDatabase, `/${room}/${otherId}`)
            onValue(dataRef3, (snapshot) => {
              console.log('happened')
              const data: { Name: string } = snapshot.val()
              if (data && data.Name) {
                const nameData = data.Name
                setReadNames((prevReadNames) => ({
                  ...prevReadNames,
                  [otherId]: nameData,
                }))

                setCurrentPlayers(playerIds.length)
              }
            })
          })
        } else setCurrentPlayers(0)
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
        <div key={`placeholder-${index}`} className="flex ml-4 py-2 mt-4 px-8 rounded-lg border-2 border-white opacity-50"></div>
      )),
    )
  }, [readNames])

  useEffect(() => {
    if (uniqueId !== '') {
      console.log(currentPlayers)
      if (currentPlayers < 2) {
        const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Score`)
        set(dataRef, 0)
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
        const hostRef = ref(projectDatabase, `/${room}/Host`)
        const hostDisconnectRef = onDisconnect(hostRef)
        const playerDisconnectRef = onDisconnect(playerRef)
        hostDisconnectRef.remove()
        playerDisconnectRef.remove()
      } else if (Object.keys(readNames).includes(uniqueId)) {
        console.log('ok')
      } else if (currentPlayers === 100) {
        console.log('first render')
      } else alert('Room is full')
    }
  }, [uniqueId, currentPlayers])
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
            <div
              key={playerId}
              className={`flex w-[250px] relative mt-4 items-center ml-4 py-2 px-8 rounded-lg border-2 border-white
            ${name.length > 5 ? 'text-lg' : name.length > 10 ? 'text-md' : 'text-xl'}`}>
              {name === playerName && playerId === uniqueId && name === 'New player'
                ? 'You'
                : name === playerName && playerId === uniqueId
                ? name + ' (you)'
                : name}
              {name === 'New player' && <span className="ml-8">...</span>}
              {playerId === hostId && (
                <span className="absolute right-4 ml-8">
                  <svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_29_148)">
                      <path d="M0 13.1797H0.4301H23V0L0 13.1797Z" fill="white" />
                      <path d="M23 13.1797H22.5699H0V0L23 13.1797Z" fill="white" />
                      <path d="M11.5 0.114624L5.75 4.19092L11.5 8.26721L17.25 4.19092L11.5 0.114624Z" fill="white" />
                      <path d="M23 15.2179H0V17.0001H23V15.2179Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip0_29_148">
                        <rect width="23" height="17" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </span>
              )}
              {/*  {name === playerName && playerId === uniqueId ? name + ' (you)' : name} */}
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
