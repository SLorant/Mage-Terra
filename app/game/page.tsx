'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set, get } from 'firebase/database'
import { useState, useEffect } from 'react'
import { ItemTypes } from '../ItemTypes'
import { useSearchParams } from 'next/navigation'
import { MapSetter } from './MapSetter'
import { SquareState } from './Interfaces'
import ScoreBoard from './ScoreBoard'

export default function Home() {
  const initialSquares: SquareState[] = Array.from({ length: 64 }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))

  const [readSquares, setReadSquares] = useState<SquareState[]>(initialSquares)
  const [readBoards, setReadBoards] = useState<{ [playerId: string]: SquareState[] }>({})

  interface PlayerInfo {
    name: string
    score: number
  }

  const [playerInfos, setPlayerInfos] = useState<{ [key: string]: PlayerInfo }>({})
  /* const [playerInfos, setPlayerInfos] = useState<number[]>([]) */

  /* type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([]) */
  const [uniqueId, setUniqueId] = useState('')
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [round, setRound] = useState<number>(1)
  const [discPlayers, setDiscPlayers] = useState(0)
  // Save the unique ID in local storage
  let otherPlayerIds: Array<string>
  const [hostId, setHostId] = useState('')
  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}/Disconnected`)
      set(playerRef, false)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.set(true)
    }
  }, [uniqueId])

  // szét kéne szedni
  useEffect(() => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    storedUniqueId && setUniqueId(storedUniqueId)
    setDiscPlayers(0)
    const playersRef = ref(projectDatabase, `/${room}`)
    //console.log(get(playersRef))
    setIsDropped(false)
    const playerRef = ref(projectDatabase, `/${room}/doneWithAction`)
    if (uniqueId !== '' && uniqueId === hostId) {
      const updateObject = { [uniqueId]: false }
      update(playerRef, updateObject)
    }
    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (data) {
        const playerIds = Object.keys(data)
        otherPlayerIds = playerIds.filter((id) => {
          return id !== localStorage.getItem('uniqueId') && id !== 'round' && id !== 'gameStarted' && id !== 'doneWithAction' && id !== 'Host'
        })
        const initialReadBoards = otherPlayerIds.reduce((acc, playerId) => {
          acc[playerId] = []
          return acc
        }, {} as { [playerId: string]: SquareState[] }) // Type assertion

        //setReadBoards(initialReadBoards)

        playerIds.forEach((otherId) => {
          const playerBoardsRef = ref(projectDatabase, `/${room}/${otherId}/Board`)
          const playerInfoRef = ref(projectDatabase, `/${room}/${otherId}`)
          if (otherId !== localStorage.getItem('uniqueId')) {
            onValue(playerBoardsRef, (snapshot) => {
              const data: { Squares: SquareState[] /* droppedDominoes: DroppedDominoes[] */ } = snapshot.val()

              if (data && data.Squares) {
                const squaresData = data.Squares.map((square) => ({
                  accepts: square.accepts,
                  lastDroppedItem: square.lastDroppedItem,
                  hasStar: square.hasStar,
                }))
                setReadSquares(squaresData)
                setReadBoards((prevReadBoards) => ({
                  ...prevReadBoards,
                  [otherId]: squaresData,
                }))
              }
              /*  if (data && data.droppedDominoes) {
                const dominoData = data.droppedDominoes
                setDroppedDominoes(dominoData)
              } */
            })
          }
          return onValue(playerInfoRef, (snapshot) => {
            const data: { Score: number; Name: string; didDrop: boolean } = snapshot.val()
            const data2: { Disconnected: boolean } = snapshot.val()
            if (data && data.Score && data.Name) {
              const scoreData = data.Score
              const nameData = data.Name
              addPlayerInfo(otherId, nameData, scoreData)
            }
            if (data2 && data2.Disconnected === true && otherId !== 'gameStarted' && otherId !== 'round') {
              setDiscPlayers(discPlayers + 1)
            }
          })
        })
      }
      if (dataHost && dataHost.Host) {
        setHostId(dataHost.Host)
      }
    })
  }, [round])

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
  }, [])

  console.log(readBoards)

  useEffect(() => {
    if (discPlayers > 0 && discPlayers === 2) {
      const playersRef = ref(projectDatabase, `/${room}`)
      const playersDisconnectRef = onDisconnect(playersRef)
      playersDisconnectRef.set(null)
      //set(playersRef, null)
    }
  }, [discPlayers])

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
    const roomRef = ref(projectDatabase, `/${room}`)
    if (uniqueId !== '') {
      const updateObject = { [uniqueId]: isDropped }
      update(playersRef, updateObject)
    }
    if (uniqueId !== '' && uniqueId === hostId) {
      const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)

      onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        const allTrue = Object.values(data).every((value) => value === true)
        if (allTrue) {
          setRound(round + 1)
          const roundRef = ref(projectDatabase, `/${room}/round`)
          set(roundRef, round + 1)
        }
      })
    }
    onValue(roomRef, (snapshot) => {
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (dataHost && dataHost.round && uniqueId !== hostId) {
        setRound(dataHost.round)
      }
    })
  }, [isDropped])

  const addPlayerInfo = (otherId: string, nameData: string, scoreData: number) => {
    setPlayerInfos((prevPlayerInfos) => {
      const updatedPlayerInfos = {
        ...prevPlayerInfos,
        [otherId]: { name: nameData, score: scoreData },
      }
      const sortedPlayerInfosArray = Object.entries(updatedPlayerInfos).sort(([, a], [, b]) => b.score - a.score)
      const sortedPlayerInfos = Object.fromEntries(sortedPlayerInfosArray)
      return sortedPlayerInfos
    })
  }
  return (
    <main className="flex h-screen  items-center justify-center font-sans ">
      <div className="flex items-top justify-center gap-10 bg-[#110928] w-[1000px]">
        <div className="mt-20  flex items-center justify-center  bg-purple-700 h-[560px] mb-20 gap-0 shadow-md">
          <DndProvider backend={HTML5Backend}>
            <Board uniqueId={uniqueId} room={room} isDropped={isDropped} setIsDropped={setIsDropped} />
          </DndProvider>
        </div>
        <ScoreBoard uniqueId={uniqueId} playerInfos={playerInfos} readBoards={readBoards} />
      </div>
    </main>
  )
}
