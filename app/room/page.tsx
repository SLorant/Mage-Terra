'use client'
import { set, ref, onValue, update, onDisconnect, DataSnapshot } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, JSX } from 'react'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'
import { useStore, usePlayerStore } from '../useStore'
import ParallaxImages from '../ParallaxImages'
import { BackButton, PrevAvatar, NextAvatar, HostCrown, Dots } from '@/utils/Vectors'
import sparkle from '@/app/animations/sparkle.json'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

const useRoomData = (room: string, uniqueId: string, wentBack: boolean) => {
  const [hostId, setHostId] = useState('')
  const router = useRouter()
  const [currentPlayers, setCurrentPlayers] = useState(100)
  const [readNames, setReadNames] = useState<{ [key: string]: { Name: string; Avatar: number } }>({})
  const firstRender = useRef(true)
  const [quickPlay, setQuickPlay] = useState<boolean>(false)
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
    const handleRoomData = (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const { gameStarted, Host, doneWithAction, quickPlay, countDown, Map, round, DisconnectedPlayers, ...playersData } = data
        if (wentBack === false) {
          setHostId(Host || uniqueId)
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, Host || uniqueId)
        } else {
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, null)
        }
        if (firstRender.current) {
          setReadNames(playersData)
          firstRender.current = false
        }
        if (quickPlay) setQuickPlay(true)
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
          /*  if (hostId !== uniqueId) {
            setCountdown(180)
          } */
        }
        setCurrentPlayers(Object.keys(playersData).length)
        if (uniqueId !== '') {
          if (gameStarted === true && (Map === null || Map === undefined)) {
            router.push(`/game?roomId=${room}`)
          } else if (gameStarted === true && Map) {
            const discRef = ref(projectDatabase, `/${room}/DisconnectedPlayers`)
            update(discRef, { [uniqueId]: true })
            set(playerRef, null)
            router.push('/')
          }
        }
      }
    }

    return onValue(roomRef, handleRoomData)
  }, [room, uniqueId])

  return { hostId, readNames, setReadNames, currentPlayers, quickPlay }
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [playerName, setPlayerName] = useState('New player')
  //const [uniqueId, setUniqueId] = useState('')
  const [isSpectator, setIsSpectator] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(1)
  const [inputName, setInputName] = useState('')
  const [countdown, setCountdown] = useState(300)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  //const [uniqueId, updateUniqueId] = useStore((state) => [state.uniqueId, state.updateUniqueId])
  const { uniqueId, initializeUniqueId } = useStore()
  const [playerCount, updatePlayerCount] = usePlayerStore((state) => [state.playerCount, state.updatePlayerCount])
  const [error, setError] = useState<string>('')
  const [wentBack, setWentBack] = useState(false)

  if (room === null) {
    return <div>Wrong room ID</div>
  }
  const { hostId, readNames, setReadNames, currentPlayers, quickPlay } = useRoomData(room, uniqueId, wentBack)

  const handlePlayGame = async () => {
    const dataRef = ref(projectDatabase, `/${room}`)
    if (currentPlayers === 1) {
      setError('Need more players to start the game')
    } else {
      if (uniqueId === hostId) {
        await update(dataRef, { gameStarted: true })
      }
      router.push(`/game?roomId=${room}`)
    }
  }

  const handleConfirmName = () => {
    if (inputName.length === 0) setError('Your name must contain characters')
    else if (inputName.length > 10) setError('Your name can be max 10 characters')
    else {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
      set(dataRef, inputName)
      const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
      set(avatarRef, currentAvatar)
      setPlayerName(inputName)
      setInputName('')
      setError('')
    }
  }
  async function handleCopyLink() {
    lottieRef.current?.playSegments([0, 25])
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

      /*  if (wentBack === false) {
      } else hostDisconnectRef.cancel() */
      const playRef = ref(projectDatabase, `/${room}/quickPlay`)
      const playDisconnectRef = onDisconnect(playRef)
      const countRef = ref(projectDatabase, `/${room}/countDown`)
      const countDisconnectRef = onDisconnect(countRef)
      if (currentPlayers === 1) {
        playDisconnectRef.remove()
        countDisconnectRef.remove()
      } else {
        playDisconnectRef.cancel()
        countDisconnectRef.cancel()
      }
    }
  }, [hostId, currentPlayers, room, uniqueId])

  useEffect(() => {
    if (uniqueId !== '' && wentBack === false) {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()
      updatePlayerCount(currentPlayers)
      const gameStartedRef = ref(projectDatabase, `/${room}/gameStarted`)
      let gameStarted: boolean = false
      onValue(gameStartedRef, (snapshot) => {
        const data = snapshot.val()
        if (data === true) gameStarted = true
      })
      if (currentPlayers !== 100 && currentPlayers < 6 && !gameStarted) {
        if (playerName === 'New player') {
          const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
          set(dataRef, 'New player')
          const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
          set(avatarRef, currentAvatar)
        }
        setIsSpectator(false)
      } else if (Object.keys(readNames).includes(uniqueId)) {
        setIsSpectator(false)
      } else if (currentPlayers !== 100) {
        setIsSpectator(true)
      }
    }
    return
  }, [uniqueId, currentPlayers])

  const [placeHolders, setPlaceHolders] = useState<JSX.Element[]>([])
  useEffect(() => {
    setPlaceHolders(
      Array.from({ length: 6 - Object.keys(readNames).length }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="md:flex hidden opacity-50 flex w-[300px] mt-8 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple"></div>
      )),
    )
  }, [readNames])
  const handleGoBack = () => {
    setWentBack(true)
    if (uniqueId === hostId) {
      const hostRef = ref(projectDatabase, `/${room}/Host`)
      set(hostRef, null)
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      set(dataRef, null)
      if (currentPlayers === 1) {
        const playRef = ref(projectDatabase, `/${room}/quickPlay`)
        set(playRef, null)
        const countRef = ref(projectDatabase, `/${room}/countDown`)
        set(countRef, null)
      }
    }
    const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
    set(dataRef, null)
    router.push(`/`)
  }

  useEffect(() => {
    if (quickPlay && !wentBack) {
      let timer: NodeJS.Timer
      const dataRef = ref(projectDatabase, `/${room}/countDown`)
      if (uniqueId === hostId && countdown > 0) {
        timer = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1)
        }, 1000)
        set(dataRef, countdown)
      }

      onValue(dataRef, (snapshot) => {
        const data: number = snapshot.val()
        if (uniqueId !== '' && hostId !== '' && uniqueId !== hostId) {
          setCountdown(data)
        }
        if (countdown === 1) {
          handleGoBack()
        }
        if (data && data === 1) {
          handleGoBack()
        }
      })
      return () => {
        clearInterval(timer)
      }
    } else return
  }, [countdown, uniqueId, hostId])
  useEffect(() => {
    setCountdown(300)
  }, [hostId])

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
  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return (
    <main className={` flex h-screen flex-col items-center justify-center text-white font-sans relative `}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="md:block hidden">
        <ParallaxImages />
      </div>
      <div
        id="roomcontainer"
        className={`${isSpectator && 'hidden'} darkbg text-xl rounded-sm roomcontainer  w-full lg:w-[800px]  flex flex-col items-center
        ${quickPlay && uniqueId !== hostId ? 'md:justify-center' : 'md:justify-start'} justify-start  z-50 relative`}>
        <button className="z-30 absolute top-4 left-6" onClick={handleGoBack}>
          <BackButton />
        </button>
        {quickPlay && <p className="absolute top-4 right-6 text-lightpurple">{uniqueId === hostId && formattedTime}</p>}
        {quickPlay ? (
          hostId === uniqueId && (
            <div id="fade-in" className="mb-4  mt-16 md:mt-12 md:text-xl text-base">
              If you think enough players joined, start the game!
            </div>
          )
        ) : (
          <div className="mb-8 relative mt-12 md:mt-8">
            To invite <span className="md:inline hidden"> your </span>friends,
            <button
              className="w-[160px] h-[40px] md:w-[200px] rounded-sm md:h-[50px] mx-4 text-2xl bg-lightpurple text-[#130242] roombutton relative"
              onClick={handleCopyLink}>
              <p className="hidden md:inline">copy this link</p>
              <p className="md:hidden inline">tap here</p>
              <Lottie
                className="w-[190px] md:h-[80px] md:w-[230px] h-[70px] absolute -top-4 -left-4"
                autoPlay={false}
                loop={false}
                animationData={sparkle}
                lottieRef={lottieRef}
              />
            </button>
            <p className="hidden md:inline"> and send it to them!</p>
          </div>
        )}

        <h2 id="fade-in" className="text-2xl md:text-3xl  mb-2">
          Choose your name and avatar
        </h2>
        <div id="fade-in" className="flex flex-col  items-center justify-center mb-8">
          <div className="flex justify-center items-center  text-3xl">
            <button className="prev mt-4" onClick={handlePrevAv}>
              <PrevAvatar />
            </button>
            <Image src={avatar} alt="mainavatar" width={100} height={100} className="w-36 h-40 mainavatar" unoptimized />

            <button className="next mt-4" onClick={handleNextAv}>
              <NextAvatar />
            </button>
          </div>
          <div id="fade-in" className="flex flex-col relative items-center justify-center">
            <div className="mt-4">
              <input
                className="text-lg md:text-xl w-[200px] h-[40px] px-2"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Your name"
              />
              <button
                className={`${isSpectator && 'opacity-50'} h-[40px] w-[100px] md:w-[120px] roombutton bg-lightpurple text-[#130242]
                transition ease-in-out duration-200 hover:bg-grey`}
                onClick={handleConfirmName}
                disabled={isSpectator ? true : false}>
                <p className="text-lg md:text-xl">I'm ready</p>
              </button>
            </div>
            {error !== '' && <p className="text-lightpurple absolute -bottom-8">{error}</p>}
          </div>
        </div>
        <div id="fade-in" className="grid h-auto w-[auto] gap-x-6 grid-cols-1 md:grid-cols-2 md:grid-rows-3 avatartable">
          {Object.keys(readNames).length > 0 &&
            Object.entries(readNames).map(([playerId, { Name, Avatar }]) => (
              <div id="fade-in" className="relative" key={playerId}>
                <div className="absolute z-40 top-[18px] left-2">
                  {Avatar === undefined ? (
                    <Image height={55} width={55} src={`/avatars/avatars-1.png`} alt="playeravatar" unoptimized></Image>
                  ) : (
                    <Image height={55} width={55} src={`/avatars/avatars-${Avatar}.png`} alt="playeravatar" unoptimized></Image>
                  )}
                </div>
                <div
                  className={`flex w-[300px] justify-between relative mt-8 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple
            ${Name.length > 5 ? 'text-lg' : Name.length > 10 ? 'text-md' : 'text-xl'}`}>
                  <p className="ml-16 mb-1">
                    {Name === playerName && playerId === uniqueId && Name === 'New player'
                      ? 'You'
                      : Name === playerName && playerId === uniqueId
                      ? Name + ' (you)'
                      : Name}
                  </p>
                  <span className="flex items-center justify-center mr-4 gap-4">
                    {playerId === hostId && (
                      <span className="">
                        <HostCrown />
                      </span>
                    )}
                    {Name === 'New player' && (
                      <span className="">
                        <Dots />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          {placeHolders}
        </div>
        {uniqueId === hostId ? (
          <button
            id="fade-in"
            className="w-[200px] mt-16 md:mt-8  h-[50px] text-2xl bg-lightpurple text-[#130242] roombutton 
          transition ease-in-out duration-200 hover:bg-grey mb-8"
            onClick={handlePlayGame}>
            <p className="mb-1">start game</p>
          </button>
        ) : (
          hostId !== '' && (
            <div id="fade-in" className="mt-8">
              Wait for the host to start the match
            </div>
          )
        )}
      </div>
      {isSpectator && (
        <div className="xl:w-1/3 h-1/3 w-full md:w-1/2 absolute z-50 darkbg flex flex-col justify-around items-center ">
          <h2 className="text-3xl mt-8 text-white">The room is full</h2>
          <div className="flex gap-10">
            <button
              className=" mt-8  text-xl md:text-2xl bg-lightpurple text-[#130242] 
          transition ease-in-out duration-200 hover:bg-grey mb-8  p-3 px-6"
              onClick={handleGoBack}>
              return to main page
            </button>
          </div>
        </div>
      )}
      <div
        className="w-3/4 md:flex md:ml-20 absolute bottom-6 sm:bottom-2 footer
       md:flex-row text-xl justify-center items-center opacity-40 h-20 z-30 flex md:gap-20 text-white">
        <a className="mb-2">Cookies</a>
        <Image className="hidden sm:inline" height={100} width={100} alt="simplelogo" src="/logosimple.png"></Image>
        <a className="mb-2">Terms & conditions</a>
      </div>
    </main>
  )
}
