'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './_components/boardcomponents/Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set } from 'firebase/database'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SquareState, PlayerInfo, DominoState } from '../../_components/Interfaces'
import ScoreBoard from './_components/ScoreBoard'
import { useStore, usePlayerStore } from '../../_components/useStore'
import VictoryScreen from './_components/VictoryScreen'
import { DominoSetter } from './_components/boardcomponents/DominoSetter'
import { Scaler } from '@/app/_components/Scaler'
import { TouchBackend } from 'react-dnd-touch-backend'
import { DominoPreview } from './_components/DominoPreview'
import DominoPicker from './_components/DominoPicker'
import Image from 'next/image'
import RoundBar from './_components/RoundBar'

export default function Home() {
  const [readBoards, setReadBoards] = useState<{ [playerId: string]: [SquareState[], string] }>({})
  const { playerCount } = usePlayerStore()
  const [playerInfos, setPlayerInfos] = useState<{ [key: string]: PlayerInfo }>({})
  const [isPlayer, setIsPlayer] = useState(false)
  const [loading, setLoading] = useState(true)
  const { uniqueId, initializeUniqueId } = useStore()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [round, setRound] = useState<number>(1)
  const [hostId, setHostId] = useState('')
  const victory = useRef(false)
  const router = useRouter()
  const [Domino, setDomino] = useState<DominoState>(DominoSetter())
  const [countdown, setCountdown] = useState(40)
  const [isRoundOver, setIsRoundOver] = useState<boolean>(false)
  const [donePicking, setDonePicking] = useState<boolean>(false)
  const [arcaneType, setArcaneType] = useState('')

  const handleDisconnection = () => {
    const playerRef = ref(projectDatabase, `/${room}/DisconnectedPlayers`)
    const roomRef = ref(projectDatabase, `/${room}`)
    const doneRef = ref(projectDatabase, `/${room}/doneWithAction/${uniqueId}`)
    const playerDisconnectRef = onDisconnect(playerRef)
    const doneDisconnectRef = onDisconnect(doneRef)
    doneDisconnectRef.set(null)
    playerDisconnectRef.update({ [uniqueId]: true })
    if (victory.current) playerDisconnectRef.cancel()
    const unsubscribeDisconnected = onValue(playerRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const playerIds = Object.keys(data)
        if (playerIds.length === playerCount - 1) {
          victory.current = true
          set(roomRef, null)
        }
      }
    })
    return () => unsubscribeDisconnected()
  }
  useEffect(() => {
    if (uniqueId && isPlayer) {
      handleDisconnection()
    }
    return
  }, [uniqueId, playerInfos])

  useEffect(() => {
    let timer: NodeJS.Timer
    if (round > 1 && countdown > 0 && victory.current === false) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)
    }
    if (countdown === 0) {
      setIsRoundOver(true)
    }
    return () => {
      clearInterval(timer)
    }
  }, [countdown, round])

  useEffect(() => {
    setIsDropped(false)
    if (!uniqueId) initializeUniqueId()
    const playersRef = ref(projectDatabase, `/${room}`)
    if (round > 19) {
      victory.current = true
      set(playersRef, null)
    }
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      const gameStarted: boolean = snapshot.child('gameStarted').exists()
      //if (!victory.current && !gameStarted) router.push('/') // Game doesn't exist
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (data) {
        setLoading(false)
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const squaresData: SquareState[] = userSnapshot.child('Squares').val()
          const nameData: string = userSnapshot.child('Name').val()
          //If the player has a name in the db, the player is valid
          if (uniqueId && playerId === uniqueId && nameData) setIsPlayer(true)
          if (squaresData) {
            setReadBoards((prevReadBoards) => ({
              ...prevReadBoards,
              [playerId]: [squaresData, nameData],
            }))
          }
          const scoreData: number = userSnapshot.child('Score').val()
          const avatarData: string = userSnapshot.child('Avatar').val()
          const dominoData: DominoState = userSnapshot.child('Domino').val()
          /*  if (playerId === uniqueId && dominoData) {
            setDomino(dominoData)
          } */
          if (nameData) addPlayerInfo(playerId, nameData, scoreData, avatarData)
        })
      }
      if (dataHost && dataHost.Host) {
        setHostId(dataHost.Host)
      } else if (uniqueId && !victory.current) {
        setHostId(uniqueId)
      }
    })
  }, [uniqueId, round])

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
    const roomRef = ref(projectDatabase, `/${room}`)
    if (uniqueId && !victory.current) {
      const updateObject = { [uniqueId]: isDropped }
      update(playersRef, updateObject)
    }
    if (uniqueId && uniqueId === hostId) {
      const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const allTrue = Object.values(data).every((value) => value === true)
          if (allTrue || isRoundOver) {
            setRound(round + 1)
            const roundRef = ref(projectDatabase, `/${room}/round`)
            set(roundRef, round + 1)
            setCountdown(33 + playerCount * 15)
            setIsRoundOver(false)
            setDonePicking(false)
          }
        }
      })
      return () => unsubscribePlayers()
    }
    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      const data: { Host: string; round: number } = snapshot.val()
      if (data && data.round && uniqueId !== hostId) {
        if (round !== data.round) {
          setRound(data.round)
          setCountdown(33 + playerCount * 15)
          setIsRoundOver(false)
          setDonePicking(false)
        }
      }
    })
    return () => unsubscribeRoom()
  }, [isDropped, isRoundOver])

  const addPlayerInfo = (otherId: string, nameData: string, scoreData: number, avatarData: string) => {
    scoreData = scoreData ?? 0
    setPlayerInfos((prevPlayerInfos) => {
      const updatedPlayerInfos = {
        ...prevPlayerInfos,
        [otherId]: { name: nameData, score: scoreData, avatar: avatarData },
      }
      const sortedPlayerInfosArray = Object.entries(updatedPlayerInfos).sort(([, a], [, b]) => b.score - a.score)
      const sortedPlayerInfos = Object.fromEntries(sortedPlayerInfosArray)
      return sortedPlayerInfos
    })
  }
  const handleGoBack = () => {
    router.push('/')
  }
  Scaler()
  return (
    <main className="flex h-screen mainbg items-center justify-center font-sans relative">
      <Image className="h-screen hidden lg:block lg:absolute top-0 left-0" src={'/hexagon.svg'} height={500} width={2000} alt="hexagon"></Image>
      {isPlayer && (
        <div id="gameContainer" className="relative">
          <div
            className=" overflow-y-auto lg:overflow-hidden  lg:w-[1100px] gamecontainer flex lg:items-start justify-center gap-16 relative
          lg:flex-row flex-col items-center">
            <div className="absolute top-0 lg:top-6 left-0 w-full h-full lg:h-[650px] bg-[#130242]">
              <div className="absolute -bottom-14 z-50 right-44 mt-8 text-2xl text-white">
                <svg width="117" height="55" viewBox="0 0 117 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M58.5 55L0.909314 0.250001L116.091 0.250011L58.5 55Z" fill="#E1DAFF" />
                </svg>
                <p className="absolute text-3xl top-0 left-10 text-darkblue z-50">{countdown}</p>
              </div>
            </div>

            <div className=" mt-28 md:mt-[600px] lg:mt-12  flex items-center justify-center  bg-purple-700 h-[560px] mb-4 gap-0 shadow-md">
              <DndProvider backend={window.innerWidth < 640 ? TouchBackend : HTML5Backend}>
                {window.innerWidth < 640 && <DominoPreview />}
                <Board
                  uniqueId={uniqueId}
                  room={room}
                  isDropped={isDropped}
                  setIsDropped={setIsDropped}
                  Domino={Domino}
                  setDomino={setDomino}
                  victory={victory}
                />
              </DndProvider>
            </div>
            {round > 2 && countdown > 30 && !donePicking && (
              <DominoPicker
                originalDomino={Domino}
                uniqueId={uniqueId}
                hostId={hostId}
                room={room ?? ''}
                countDown={countdown}
                setDomino={setDomino}
                readBoards={readBoards}
                setDonePicking={setDonePicking}
                arcaneType={arcaneType}
              />
            )}
            <div className="flex lg:w-auto w-full mt-6 flex-col justify-center items-center bg-[#130242]">
              <ScoreBoard uniqueId={uniqueId} playerInfos={playerInfos} readBoards={readBoards} />
              <RoundBar round={round} setArcaneType={setArcaneType} uniqueId={uniqueId} hostId={hostId} room={room ?? ''} />
            </div>
          </div>
        </div>
      )}
      {!isPlayer && (
        <div className="xl:w-1/3 h-1/3 w-full md:w-1/2 absolute z-50 darkbg rounded-sm flex flex-col justify-around items-center">
          <h2 className="text-2xl xl:text-3xl mt-8  text-white ">{loading ? 'Loading...' : 'The game has already started'}</h2>
          <div className="flex">
            {!loading && (
              <button
                className="w-[275px] h-14 mt-8  text-2xl bg-lightpurple text-[#130242] 
          transition ease-in-out duration-200 hover:bg-grey mb-8"
                onClick={handleGoBack}>
                return to main page
              </button>
            )}
          </div>
        </div>
      )}

      {victory.current && (
        <div className="absolute flex h-full items-center justify-center w-full top-0 left-0">
          <div className="darkbg w-full h-full absolute top-0 left-0 z-20"></div>
          <VictoryScreen uniqueId={uniqueId} playerInfos={playerInfos} />
        </div>
      )}
    </main>
  )
}
/*{round % 2 === 0 && <Trading room={room} uniqueId={uniqueId} Domino={Domino} round={round} hostId={hostId} setIsRoundOver={setIsRoundOver} />}
 */
