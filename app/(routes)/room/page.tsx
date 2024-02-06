'use client'
import { set, ref, onValue, update, onDisconnect } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'
import { useStore } from '../../_components/useStore'
import ParallaxImages from '../../_components/ParallaxImages'
import { BackButton } from '@/app/_components/Vectors'
import sparkle from '@/app/_assets/animations/sparkle.json'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { useRoomData } from './_components/useRoomData'
import PlayerGrid from './_components/PlayerGrid'
import AvatarChooser from './_components/AvatarChooser'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const { uniqueId, initializeUniqueId } = useStore()
  const [playerName, setPlayerName] = useState('New player')
  const [isSpectator, setIsSpectator] = useState(false)
  const [countdown, setCountdown] = useState(300)
  const [error, setError] = useState<string>('')
  const [wentBack, setWentBack] = useState(false)
  const { hostId, readNames, setReadNames, currentPlayers, quickPlay } = useRoomData(room ?? '', uniqueId, wentBack)

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

  async function handleCopyLink() {
    lottieRef.current?.playSegments([0, 25])
    await navigator.clipboard.writeText(location.href)
  }
  useEffect(() => {
    if (!uniqueId) initializeUniqueId()
  }, [])

  useEffect(() => {
    if (hostId) {
      //Make the host always the first player in the grid
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
      const playRef = ref(projectDatabase, `/${room}/quickPlay`)
      const playDisconnectRef = onDisconnect(playRef)
      const countRef = ref(projectDatabase, `/${room}/countDown`)
      const countDisconnectRef = onDisconnect(countRef)
      //When the last player quits too, the room gets deleted
      if (currentPlayers === 1) {
        playDisconnectRef.remove()
        countDisconnectRef.remove()
      } else {
        playDisconnectRef.cancel()
        countDisconnectRef.cancel()
      }
    }
  }, [hostId, currentPlayers, room, uniqueId])

  const handleGoBack = () => {
    setWentBack(true)
    if (uniqueId === hostId) {
      const hostRef = ref(projectDatabase, `/${room}/Host`)
      set(hostRef, null)
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      set(dataRef, null)
      //This is needed because the routing doesn't disconnect the user, so the room must be deleted manually
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
      const unsubscribeCount = onValue(dataRef, (snapshot) => {
        const data: number = snapshot.val()
        if (uniqueId && hostId && uniqueId !== hostId) {
          setCountdown(data)
        }
        if (countdown === 1 || (data && data === 1)) {
          handleGoBack()
        }
      })
      return () => {
        clearInterval(timer)
        unsubscribeCount()
      }
    } else return
  }, [countdown, uniqueId, hostId])

  useEffect(() => {
    setCountdown(301)
  }, [hostId])

  //Format the time
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
        id="fade-in-fast"
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

        <h2 id="fade-in" className={`${hostId !== uniqueId && 'mt-16 md:mt-0'} text-2xl md:text-3xl  mb-2`}>
          Choose your name and avatar
        </h2>
        <AvatarChooser
          room={room ?? ''}
          uniqueId={uniqueId}
          isSpectator={isSpectator}
          setIsSpectator={setIsSpectator}
          error={error}
          setError={setError}
          playerName={playerName}
          setPlayerName={setPlayerName}
          currentPlayers={currentPlayers}
          readNames={readNames}
          wentBack={wentBack}
        />
        <PlayerGrid readNames={readNames} playerName={playerName} uniqueId={uniqueId} hostId={hostId} />
        {uniqueId === hostId ? (
          <button
            id="fade-in"
            className="w-[200px] mt-16 md:mt-8  h-[50px] text-2xl bg-lightpurple text-[#130242] roombutton 
          transition ease-in-out duration-200 hover:bg-grey mb-8"
            onClick={handlePlayGame}>
            <p className="mb-1">start game</p>
          </button>
        ) : (
          hostId && (
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
