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
  const avatars: string[] = ['avatars-01.png', 'avatars-02.png', 'avatars-03.png']
  const [playerName, setPlayerName] = useState('')
  const [uniqueId, setUniqueId] = useState('')
  const [hostId, setHostId] = useState('')
  const [currentPlayers, setCurrentPlayers] = useState(100)
  const [readNames, setReadNames] = useState<{ [key: string]: [string, string] }>({})
  const [isSpectator, setIsSpectator] = useState(false)
  const handlePlayGame = () => {
    router.push(`/game?roomId=${room}`)
    const dataRef = ref(projectDatabase, `/${room}`)
    update(dataRef, { gameStarted: true })
  }
  const [inputName, setInputName] = useState('')

  const handleConfirmName = () => {
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
    set(dataRef, inputName)
    const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
    set(avatarRef, avatarPath)
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
              const data: { Name: string; Avatar: string } = snapshot.val()
              if (data && data.Name && data.Avatar) {
                const nameData = data.Name
                const avatarData = data.Avatar
                setReadNames((prevReadNames) => ({
                  ...prevReadNames,
                  [otherId]: [nameData, avatarData],
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
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    if (uniqueId !== '') {
      console.log(currentPlayers)
      if (currentPlayers < 2) {
        /* const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Score`)
        set(dataRef, 0) */
        const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
        if (playerName === '') {
          setPlayerName('New player')
          setReadNames((prevReadNames) => ({
            ...prevReadNames,
            [uniqueId]: ['New player', 'avatar-1.png'],
          }))
          const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
          set(dataRef, 'New player')
          const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
          set(avatarRef, 'avatar-1.png')
        }
        setIsSpectator(false)
        const hostRef = ref(projectDatabase, `/${room}/Host`)
        const hostDisconnectRef = onDisconnect(hostRef)
        //const playerDisconnectRef = onDisconnect(playerRef)
        hostDisconnectRef.remove()
        //playerDisconnectRef.remove()
      } else if (Object.keys(readNames).includes(uniqueId)) {
        console.log('ok')
        setIsSpectator(false)
      } else if (currentPlayers === 100) {
        console.log('first render')
      } else {
        setIsSpectator(true)
        setIsVisible(true)
      }
    }
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
  const [currentAvatar, setCurrentAvatar] = useState(1)
  const [avatarPath, setAvatarPath] = useState('avatar-1.png')
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
  useEffect(() => {
    setAvatarPath(`avatar-${currentAvatar}.png`)
  }, [currentAvatar])
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
            <Image src={avatarPath} alt="mainavatar" width={100} height={100} className="w-36 h-40 " unoptimized />

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
          {Object.entries(readNames).map(([playerId, [name, avatar]]) => (
            <div className="relative" key={playerId}>
              <div className="absolute left-0 z-40 top-1">
                <Image height={60} width={60} src={`/${avatar}`} alt="playeravatar"></Image>
              </div>
              <div
                className={`flex w-[250px] justify-center relative mt-4 items-center ml-4 py-2 px-8 rounded-lg border-2 border-white
            ${name.length > 5 ? 'text-lg' : name.length > 10 ? 'text-md' : 'text-xl'}`}>
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
                  {name === playerName && playerId === uniqueId && name === 'New player'
                    ? 'You'
                    : name === playerName && playerId === uniqueId
                    ? name + ' (you)'
                    : name}
                  {name === 'New player' && <span className="absolute right-2 bottom-3">...</span>}
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
