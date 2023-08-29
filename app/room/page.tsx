'use client'
import { set, ref, onValue, update, onDisconnect, DataSnapshot, remove } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'
import { useStore, usePlayerStore } from '../useStore'
import ParallaxImages from '../ParallaxImages'

const useRoomData = (room: string, uniqueId: string) => {
  const [hostId, setHostId] = useState('')
  const router = useRouter()
  const [currentPlayers, setCurrentPlayers] = useState(100)
  const [readNames, setReadNames] = useState<{ [key: string]: { Name: string; Avatar: number } }>({})
  const firstRender = useRef(true)
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    const handleRoomData = (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const { gameStarted, Host, doneWithAction, ...playersData } = data
        setHostId(Host || uniqueId)
        const dataRef = ref(projectDatabase, `/${room}/Host`)
        set(dataRef, Host || uniqueId)

        if (firstRender.current) {
          setReadNames(playersData)
          firstRender.current = false
        }
        if (Host !== '') {
          const sortedNamesArray = Object.entries(playersData).sort((a, b) => {
            if (a[0] === Host) return -1 // Move host player to the beginning
            if (b[0] === Host) return 1
            return 0
          })
          const sortedReadNames = sortedNamesArray.reduce((obj: any, [key, value]) => {
            obj[key] = value
            return obj
          }, {})
          setReadNames(sortedReadNames)
        }
        setCurrentPlayers(Object.keys(playersData).length)
        gameStarted === true && router.push(`/game?roomId=${room}`)
      }
    }

    return onValue(roomRef, handleRoomData)
  }, [room, uniqueId])

  return { hostId, readNames, setReadNames, currentPlayers }
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
  const { hostId, readNames, setReadNames, currentPlayers } = useRoomData(room, uniqueId)

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
    const randomAvatar = Math.floor(Math.random() * 12)
    if (randomAvatar > 0) setCurrentAvatar(randomAvatar)
  }, [])

  useEffect(() => {
    if (hostId !== '') {
      const sortedNamesArray = Object.entries(readNames).sort((a, b) => {
        if (a[0] === hostId) return -1 // Move host player to the beginning
        if (b[0] === hostId) return 1
        return 0
      })
      const sortedReadNames = sortedNamesArray.reduce((obj: any, [key, value]) => {
        obj[key] = value
        return obj
      }, {})
      setReadNames(sortedReadNames)
    }
    if (uniqueId === hostId) {
      const hostRef = ref(projectDatabase, `/${room}/Host`)
      const hostDisconnectRef = onDisconnect(hostRef)
      hostDisconnectRef.remove()
    }
  }, [hostId, currentPlayers, room, uniqueId])

  useEffect(() => {
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()
      updatePlayerCount(currentPlayers)

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
        <div
          key={`placeholder-${index}`}
          className=" opacity-50 flex w-[300px] mt-9 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple"></div>
      )),
    )
  }, [readNames])

  const handleGoBack = () => {
    setIsVisible(false)
    if (uniqueId === hostId) {
      const hostRef = ref(projectDatabase, `/${room}/Host`)
      set(hostRef, null)
    }
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

  return (
    <main className={` flex h-screen flex-col items-center justify-center text-white font-sans relative`}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <ParallaxImages />

      <div className={`${isVisible && 'opacity-40'} darkbg text-xl mb-20 rounded-sm h-[80%] w-[800px] flex flex-col items-center justify-center z-50 relative`}>
        <button className="z-30 absolute top-4 left-6" onClick={handleGoBack}>
          <svg width="17" height="24" viewBox="0 0 17 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.3511 5.38048L6.4946 5.36768L6.48826 0.482322L0.110653 6.86207L6.50378 13.2573L6.49743 8.37199L13.3507 8.38089L13.367 20.1162L0.127845 20.0991L0.13282 23.1034L16.3741 23.1234L16.3511 5.38048Z"
              fill="#B8AFE0"
            />
          </svg>
        </button>
        <div className="mb-6">
          To invite your friends,
          <button className="w-[200px] rounded-sm h-[50px] mx-4 text-2xl bg-lightpurple text-[#130242]" onClick={handleCopyLink}>
            copy this link
          </button>
          and send it to them!
        </div>
        <h2 className="text-3xl  mb-2">Choose your name and avatar</h2>
        <div className="flex flex-col  items-center justify-center mb-8">
          <div className="flex justify-center items-center  text-3xl">
            <button className="prev mt-4" onClick={handlePrevAv}>
              <svg width="20" height="46" viewBox="0 0 20 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0 22.8741L19.5025 45.2756V45.2611C17.3079 38.1913 16.1239 30.6722 16.1239 22.8741C16.1239 15.0759 17.3079 7.5568 19.5025 0.487026V0.472534L0 22.8741Z"
                  fill="white"
                />
              </svg>
            </button>
            <Image src={avatar} alt="mainavatar" width={100} height={100} className="w-36 h-40 " unoptimized />

            <button className="next mt-4" onClick={handleNextAv}>
              <svg width="20" height="46" viewBox="0 0 20 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20 22.8741L0.497559 0.472534V0.487026C2.69217 7.5568 3.87611 15.0759 3.87611 22.8741C3.87611 30.6722 2.69217 38.1913 0.497559 45.2611V45.2756L20 22.8741Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-col">
            <div className="mt-4">
              <input
                className="text-xl w-[200px] h-[40px] px-2"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Your name"
              />
              <button
                className={`${isSpectator && 'opacity-50'} h-[40px] w-[120px]  bg-lightpurple text-[#130242]`}
                onClick={handleConfirmName}
                disabled={isSpectator ? true : false}>
                <p className="text-xl">I'm ready</p>
              </button>
            </div>
          </div>
        </div>
        <div className="grid h-auto w-[auto] gap-x-6 grid-cols-2 grid-rows-3">
          {Object.keys(readNames).length > 0 &&
            Object.entries(readNames).map(([playerId, { Name, Avatar }]) => (
              <div className="relative" key={playerId}>
                <div className="absolute z-40 top-5 left-2">
                  {Avatar === undefined ? (
                    <Image height={60} width={60} src={`/avatars/avatars_small-1.png`} alt="playeravatar"></Image>
                  ) : (
                    <Image height={60} width={60} src={`/avatars/avatars_small-${Avatar}.png`} alt="playeravatar"></Image>
                  )}
                </div>
                <div
                  className={`flex w-[300px] justify-center relative mt-9 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple
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
          <button className="w-[200px] mt-6  h-[50px] text-2xl bg-lightpurple text-[#130242]" onClick={handlePlayGame}>
            <p className="mb-1">start game</p>
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
      <div
        className="w-3/4 sm:ml-20 absolute bottom-6 sm:bottom-2
       sm:flex-row flex-col text-xl justify-center items-center opacity-40 h-20 z-30 flex sm:gap-20 text-white">
        <a className="mb-2">Cookies</a>
        <Image className="hidden sm:inline" height={100} width={100} alt="simplelogo" src="/logosimple.png"></Image>
        <a className="mb-2">Terms & conditions</a>
      </div>
    </main>
  )
}
