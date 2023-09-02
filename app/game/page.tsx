'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set, runTransaction } from 'firebase/database'
import { useState, useEffect, useRef } from 'react'
import { ItemTypes } from '../ItemTypes'
import { useRouter, useSearchParams } from 'next/navigation'
import { MapSetter } from './MapSetter'
import { SquareState, PlayerInfo, DominoState } from './Interfaces'
import ScoreBoard from './ScoreBoard'
import { useStore, usePlayerStore } from '../useStore'
import VictoryScreen from './VictoryScreen'
import Trading from './Trading'
import { DominoSetter } from './DominoSetter'

export default function Home() {
  const initialSquares: SquareState[] = Array.from({ length: 64 }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))

  const [readSquares, setReadSquares] = useState<SquareState[]>(initialSquares)
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
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/DisconnectedPlayers`)
      const roomRef = ref(projectDatabase, `/${room}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.update({ [uniqueId]: true })
      if (victory.current) playerDisconnectRef.cancel()
      onValue(playerRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const playerIds = Object.keys(data)
          if (playerIds.length === playerCount - 1) {
            victory.current = true
            console.log(data)
            set(roomRef, null)
          }
        }
      })
    }
  }, [uniqueId, playerInfos])

  const [countdown, setCountdown] = useState(100)
  const [isRoundOver, setIsRoundOver] = useState<boolean>(false)
  useEffect(() => {
    let timer: any

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

  useEffect(() => {
    setIsDropped(false)
    const playersRef = ref(projectDatabase, `/${room}`)
    if (round > 14) {
      victory.current = true
      set(playersRef, null)
    }
    const playerRef = ref(projectDatabase, `/${room}/doneWithAction`)
    /*  if (uniqueId !== '' && uniqueId === hostId && victory.current === false) {
      const updateObject = { [uniqueId]: false }
      update(playerRef, updateObject)
    } */
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      console.log(snapshot.key)
      const countDown: number = snapshot.child('countDown').val()
      if (countDown === undefined || countDown === null) router.push('/')
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (data) {
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const squaresData: SquareState[] = userSnapshot.child('Squares').val()
          const nameData: string = userSnapshot.child('Name').val()
          if (uniqueId !== '') {
            if (playerId === uniqueId && nameData === null) {
              const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
              set(playerRef, null)
              router.push('/')
            } else if (playerId === uniqueId && nameData !== null) setIsPlayer(true)
          }

          if (squaresData !== null) {
            setReadSquares(squaresData)
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
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
    console.log('setting map')
    if (firstRender) {
      if (uniqueId === '') {
        initializeUniqueId()
      }
      firstRender.current = false
    }
    const roomRef = ref(projectDatabase, `/${room}`)
    return onValue(roomRef, (snapshot) => {
      console.log(snapshot.key)
      if (snapshot.key === null) router.push('/')
    })
  }, [])

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
    const roomRef = ref(projectDatabase, `/${room}`)
    if (uniqueId !== '' && victory.current === false) {
      const updateObject = { [uniqueId]: isDropped }
      update(playersRef, updateObject)
    }
    if (uniqueId !== '' && uniqueId === hostId) {
      const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
      const unsubscribePlayers = onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const allTrue = Object.values(data).every((value) => value === true)
          if (allTrue /* || isRoundOver */) {
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
  return (
    <main className="flex h-screen mainbg items-center justify-center font-sans relative">
      {isPlayer && (
        <div className="flex items-top justify-center gap-10 darkbg w-[1000px] relative">
          <div className="mt-20  flex items-center justify-center  bg-purple-700 h-[560px] mb-20 gap-0 shadow-md relative">
            <DndProvider backend={HTML5Backend}>
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

          <ScoreBoard uniqueId={uniqueId} playerInfos={playerInfos} readBoards={readBoards} />
        </div>
      )}
      {!isPlayer && (
        <div className="w-1/3 h-1/3 absolute z-50 bg-[#EFCEFB] flex flex-col justify-around items-center rounded-md">
          <h2 className="text-3xl mt-8 text-black">The game has already started</h2>
          <div className="flex">
            <button className="px-4 rounded-sm py-2 mx-4 text-3xl bg-[#B8AFE0] text-[#2F1F55]" onClick={handleGoBack}>
              Return to home page
            </button>
          </div>
        </div>
      )}
      <div className="darkbg w-full h-full absolute top-0 left-0 z-20"></div>
      && <VictoryScreen uniqueId={uniqueId} playerInfos={playerInfos} />
      <div>
        <p>Countdown: {countdown} seconds</p>
      </div>
    </main>
  )
}
/*{round % 2 === 0 && <Trading room={room} uniqueId={uniqueId} Domino={Domino} round={round} hostId={hostId} setIsRoundOver={setIsRoundOver} />}
 */
