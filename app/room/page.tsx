'use client'
import { set, ref, onValue, update, onDisconnect, DataSnapshot, remove, OnDisconnect } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'
import { useStore, usePlayerStore } from '../useStore'

const useRoomData = (room: string, uniqueId: string) => {
  const [hostId, setHostId] = useState('')
  const router = useRouter()
  const [currentPlayers, setCurrentPlayers] = useState(100)
  const [readNames, setReadNames] = useState<{ [key: string]: { Name: string; Avatar: number } }>({})
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    const handleRoomData = (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const { gameStarted, Host, doneWithAction, ...playersData } = data
        setHostId(Host || uniqueId)
        const dataRef = ref(projectDatabase, `/${room}/Host`)
        set(dataRef, Host || uniqueId)
        setReadNames(playersData)
        setCurrentPlayers(Object.keys(playersData).length)
        gameStarted === true && router.push(`/game?roomId=${room}`)
      }
    }

    return onValue(roomRef, handleRoomData)
  }, [room, uniqueId])

  return { hostId, readNames, currentPlayers }
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [playerName, setPlayerName] = useState('New Player')
  //const [uniqueId, setUniqueId] = useState('')
  const [isSpectator, setIsSpectator] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(1)
  const [inputName, setInputName] = useState('')
  //const [uniqueId, updateUniqueId] = useStore((state) => [state.uniqueId, state.updateUniqueId])
  const { uniqueId, initializeUniqueId } = useStore()
  const [playerCount, updatePlayerCount] = usePlayerStore((state) => [state.playerCount, state.updatePlayerCount])

  if (room === null) {
    return <div>Wrong room ID</div>
  }
  const { hostId, readNames, currentPlayers } = useRoomData(room, uniqueId)

  const handlePlayGame = async () => {
    const dataRef = ref(projectDatabase, `/${room}`)
    if (currentPlayers === 1) {
      alert('Need more players to start the game')
    } else {
      if (uniqueId === hostId) {
        await update(dataRef, { gameStarted: true })
      }
      router.push(`/game?roomId=${room}`)
    }
  }

  const handleConfirmName = () => {
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
    set(dataRef, inputName)
    const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
    set(avatarRef, currentAvatar)
    setPlayerName(inputName)
    setInputName('')
  }
  async function handleCopyLink() {
    await navigator.clipboard.writeText(location.href)
  }
  useEffect(() => {
    if (uniqueId === '') {
      initializeUniqueId()
    }
  }, [])

  useEffect(() => {
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()
      updatePlayerCount(currentPlayers)
      if (uniqueId === hostId) {
        const hostRef = ref(projectDatabase, `/${room}/Host`)
        const hostDisconnectRef = onDisconnect(hostRef)
        hostDisconnectRef.remove()
      }
      if (currentPlayers !== 100 && currentPlayers < 4) {
        if (playerName === 'New Player') {
          const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
          set(dataRef, 'New player')
          const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
          set(avatarRef, currentAvatar)
        }
        setIsSpectator(false)
        setIsVisible(false)
      } else if (Object.keys(readNames).includes(uniqueId)) {
        setIsSpectator(false)
        setIsVisible(false)
      } else if (currentPlayers !== 100) {
        setIsSpectator(true)
        setIsVisible(true)
      }
    }
    return
  }, [uniqueId, currentPlayers])

  const [placeHolders, setPlaceHolders] = useState<any[]>([])
  useEffect(() => {
    setPlaceHolders(
      Array.from({ length: 6 - Object.keys(readNames).length }).map((_, index) => (
        <div key={`placeholder-${index}`} className="flex ml-4 py-2 mt-4 px-8 rounded-lg border-2 border-white opacity-50"></div>
      )),
    )
  }, [readNames])
  const handleGoBack = () => {
    setIsVisible(false)
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
    set(dataRef, null)
    router.push(`/`)
  }
  const handleNextAv = () => {
    if (currentAvatar > 11) {
      setCurrentAvatar(1)
    } else setCurrentAvatar(currentAvatar + 1)
  }
  const handlePrevAv = () => {
    if (currentAvatar < 2) {
      setCurrentAvatar(12)
    } else setCurrentAvatar(currentAvatar - 1)
  }

  const avatar = `avatar-${currentAvatar}.png`
  console.log(readNames)
  return (
    <main className={` flex h-screen flex-col items-center justify-center text-white font-sans relative`}>
      <button className="" onClick={handleGoBack}>
        Go Back
      </button>
      <div className={`${isVisible && 'opacity-40'} bg-[#170e2ea3] text-xl mb-20 rounded-lg h-[700px] w-[800px] flex flex-col items-center justify-center `}>
        <div className="mb-8">
          To invite your friends,
          <button className="px-4 rounded-sm py-2 mx-4 text-2xl bg-[#B8AFE0] text-[#2F1F55]" onClick={handleCopyLink}>
            copy this link
          </button>
          and send it to them!
        </div>
        <h2 className="italic text-2xl mt-4 mb-2">Choose your name and avatar</h2>
        <div className="flex flex-col  items-center justify-center mb-8">
          <div className="flex justify-center items-center gap-4 text-3xl">
            <button className="prev" onClick={handlePrevAv}>
              &#10094;
            </button>
            <Image src={avatar} alt="mainavatar" width={100} height={100} className="w-36 h-40 " unoptimized />

            <button className="next" onClick={handleNextAv}>
              &#10095;
            </button>
          </div>
          <div className="flex flex-col ml-8">
            <div className="mt-4">
              <input className="text-lg rounded-lg" type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Your name" />
              <button
                className={`${isSpectator && 'opacity-50'} px-4 ml-4 rounded-md py-1 text-lg bg-[#EFCEFB] text-black`}
                onClick={handleConfirmName}
                disabled={isSpectator ? true : false}>
                Ready
              </button>
            </div>
          </div>
        </div>
        <div className="grid h-auto w-[auto] gap-x-6 grid-cols-2 grid-rows-3">
          {Object.keys(readNames).length > 0 &&
            Object.entries(readNames).map(([playerId, { Name, Avatar }]) => (
              <div className="relative" key={playerId}>
                <div className="absolute left-0 z-40 top-1">
                  <Image height={60} width={60} src={`/avatar-${Avatar}.png`} alt="playeravatar"></Image>
                </div>
                <div
                  className={`flex w-[250px] justify-center relative mt-4 items-center ml-4 py-2 px-8 rounded-lg border-2 border-white
            ${Name.length > 5 ? 'text-lg' : Name.length > 10 ? 'text-md' : 'text-xl'}`}>
                  {playerId === hostId && (
                    <span className="absolute left-14">
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
                  <p className="ml-8">
                    {Name === playerName && playerId === uniqueId && Name === 'New player'
                      ? 'You'
                      : Name === playerName && playerId === uniqueId
                      ? Name + ' (you)'
                      : Name}
                    {Name === 'New player' && <span className="absolute right-2 bottom-3">...</span>}
                  </p>
                  {/*  {name === playerName && playerId === uniqueId ? name + ' (you)' : name} */}
                </div>
              </div>
            ))}
          {placeHolders}
        </div>
        {uniqueId === hostId ? (
          <button className="px-8 mt-6 rounded-md py-2 text-3xl bg-[#EFCEFB] text-black" onClick={handlePlayGame}>
            Start game
          </button>
        ) : (
          <div className="mt-6">Wait for the host to start the match</div>
        )}
      </div>
      {isSpectator && isVisible && (
        <div className="w-1/3 h-1/3 absolute z-50 bg-[#EFCEFB] flex flex-col justify-around items-center rounded-md">
          <h2 className="text-3xl mt-8 text-black">The room is full</h2>
          <div className="flex">
            <button className="px-4 rounded-sm py-2 mx-4 text-3xl bg-[#B8AFE0] text-[#2F1F55]" onClick={handleGoBack}>
              Go Back
            </button>
            <button
              className="px-4 rounded-sm py-2 mx-4 text-2xl bg-[#B8AFE0] text-[#2F1F55]"
              onClick={() => {
                setIsVisible(false)
              }}>
              Wait for someone to quit
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
