'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './_components/Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set } from 'firebase/database'
import { useState, useEffect, useRef, CSSProperties } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SquareState, PlayerInfo, DominoState } from '../../_components/Interfaces'
import ScoreBoard from './_components/ScoreBoard'
import { useStore, usePlayerStore } from '../../_components/useStore'
import VictoryScreen from './_components/VictoryScreen'
import { DominoSetter } from './_components/DominoSetter'
import { Scaler } from '@/app/_components/Scaler'
import { TouchBackend } from 'react-dnd-touch-backend'
import { usePreview } from 'react-dnd-preview'
import Image from 'next/image'

const MyPreview = () => {
  const preview = usePreview()
  if (!preview.display) {
    return null
  }
  const { item, style } = preview as { itemType: string; item: DominoState; style: CSSProperties }
  return (
    <div className="z-50 flex" style={style}>
      <div className={`h-[14.5vw] w-[14.5vw] md:h-auto md:w-auto ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
        <Image src={item.img} alt="kep" width={20} height={20} className={`w-full h-full`} draggable="false" unoptimized />
      </div>
      <div className={`h-[14.5vw] w-[14.5vw] md:h-auto md:w-auto ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
        <Image src={item.secondimg} alt="kep" width={20} height={20} className={`w-full h-full`} draggable="false" unoptimized />
      </div>
    </div>
  )
}

export default function Home() {
  const [readBoards, setReadBoards] = useState<{ [playerId: string]: [SquareState[], string] }>({})

  const { playerCount } = usePlayerStore()
  const [playerInfos, setPlayerInfos] = useState<{ [key: string]: PlayerInfo }>({})

  const { uniqueId, initializeUniqueId } = useStore()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [round, setRound] = useState<number>(1)
  const [hostId, setHostId] = useState('')
  const victory = useRef(false)
  const router = useRouter()
  const firstRender = useRef(true)
  const [Domino, setDomino] = useState<DominoState>(DominoSetter())

  useEffect(() => {
    if (uniqueId !== '' && isPlayer) {
      const playerRef = ref(projectDatabase, `/${room}/DisconnectedPlayers`)
      const roomRef = ref(projectDatabase, `/${room}`)
      const doneRef = ref(projectDatabase, `/${room}/doneWithAction/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      const doneDisconnectRef = onDisconnect(doneRef)
      doneDisconnectRef.set(null)
      playerDisconnectRef.update({ [uniqueId]: true })
      if (victory.current) playerDisconnectRef.cancel()
      onValue(playerRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const playerIds = Object.keys(data)
          if (playerIds.length === playerCount - 1) {
            victory.current = true
            set(roomRef, null)
          }
        }
      })
    }
  }, [uniqueId, playerInfos])
  const [countdown, setCountdown] = useState(40)
  const [isRoundOver, setIsRoundOver] = useState<boolean>(false)
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
  const [isPlayer, setIsPlayer] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setIsDropped(false)
    const playersRef = ref(projectDatabase, `/${room}`)
    if (round > 14) {
      victory.current = true
      set(playersRef, null)
    }
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      const gameStarted: boolean = snapshot.child('gameStarted').exists()
      if (!victory.current && !gameStarted) router.push('/')
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (data) {
        setLoading(false)
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const squaresData: SquareState[] = userSnapshot.child('Squares').val()
          const nameData: string = userSnapshot.child('Name').val()
          if (uniqueId !== '') {
            if (playerId === uniqueId && nameData === null && !victory.current && !gameStarted) {
              const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
              set(playerRef, null)
              router.push('/')
            } else if (playerId === uniqueId && nameData !== null) setIsPlayer(true)
          }

          if (squaresData !== null) {
            setReadBoards((prevReadBoards) => ({
              ...prevReadBoards,
              [playerId]: [squaresData, nameData],
            }))
          }
          const scoreData: number = userSnapshot.child('Score').val()
          const avatarData: string = userSnapshot.child('Avatar').val()
          const dominoData: DominoState = userSnapshot.child('Domino').val()
          if (playerId === uniqueId && dominoData !== null && dominoData !== undefined) {
            setDomino(dominoData)
          }
          if (nameData !== null) addPlayerInfo(playerId, nameData, scoreData, avatarData)
        })
      }
      if (dataHost && dataHost.Host) {
        setHostId(dataHost.Host)
      } else if (uniqueId !== '' && victory.current === false) {
        setHostId(uniqueId)
        /* const dataRef = ref(projectDatabase, `/${room}/Host`)
        set(dataRef, uniqueId) */
      }
    })
  }, [uniqueId, round])

  useEffect(() => {
    if (firstRender) {
      if (uniqueId === '') {
        initializeUniqueId()
      }
      firstRender.current = false
    }
  }, [])
  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
    const roomRef = ref(projectDatabase, `/${room}`)
    if (uniqueId !== '' && victory.current === false) {
      const updateObject = { [uniqueId]: isDropped }
      update(playersRef, updateObject)
    }
    if (uniqueId !== '' && uniqueId === hostId) {
      const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const allTrue = Object.values(data).every((value) => value === true)
          if (allTrue || isRoundOver) {
            setRound(round + 1)
            const roundRef = ref(projectDatabase, `/${room}/round`)
            set(roundRef, round + 1)
            setCountdown(30)
            setIsRoundOver(false)
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
          setCountdown(30)
          setIsRoundOver(false)
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
      {isPlayer && (
        <div
          id="gameContainer"
          className="overflow-y-auto md:w-full lg:w-[1100px] gamecontainer flex lg:items-start justify-center gap-10 darkbg relative
          lg:flex-row flex-col items-center">
          <div className=" mt-20 md:mt-[600px] lg:mt-12  flex items-center justify-center  bg-purple-700 h-[560px] mb-20 gap-0 shadow-md">
            <DndProvider backend={window.innerWidth < 640 ? TouchBackend : HTML5Backend}>
              {window.innerWidth < 640 && <MyPreview />}
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
          <div className="flex flex-col justify-center items-center ">
            <ScoreBoard uniqueId={uniqueId} playerInfos={playerInfos} readBoards={readBoards} />
            <div id="fade-in" className="md:mt-8 lg:mb-0 md:mb-8  md:static absolute top-0 left-0">
              <svg width="335" height="28" viewBox="0 0 335 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <svg width={round * 22} height={round > 1 ? '28' : '0'} viewBox={`0 0 ${round * 22} 20`} fill="#B8AFE0" xmlns="http://www.w3.org/2000/svg">
                  <path d={`M${round * 22} 20H0V0H${round * 22}V20Z`} fill="#B8AFE0" />
                </svg>
                <path d="M332.406 26.1667H2.59375V1.83342H332.406V26.1667Z" stroke="#E1DAFF" strokeWidth="6" strokeMiterlimit="10" />
              </svg>
            </div>
            <div className="lg:static absolute top-4 right-10 mt-8 text-2xl text-white">
              <p>{countdown}</p>
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
