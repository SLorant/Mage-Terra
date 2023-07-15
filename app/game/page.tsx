'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set } from 'firebase/database'
import { useState, useEffect } from 'react'
import { ItemTypes } from '../ItemTypes'
import { MiniSquare } from './MiniSquare'
import { useSearchParams } from 'next/navigation'
import { MapSetter } from './MapSetter'
import { SquareState } from './Interfaces'

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

  type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([])
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

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      const dataHost: { Host: string; round: number } = snapshot.val()
      if (data) {
        const playerIds = Object.keys(data)
        otherPlayerIds = playerIds.filter((id) => id !== localStorage.getItem('uniqueId'))
        const initialReadBoards = otherPlayerIds.reduce((acc, playerId) => {
          acc[playerId] = []
          return acc
        }, {} as { [playerId: string]: SquareState[] }) // Type assertion

        setReadBoards(initialReadBoards)

        playerIds.forEach((otherId) => {
          const playerBoardsRef = ref(projectDatabase, `/${room}/${otherId}/Board`)
          const playerInfoRef = ref(projectDatabase, `/${room}/${otherId}`)
          if (otherId !== localStorage.getItem('uniqueId')) {
            onValue(playerBoardsRef, (snapshot) => {
              const data: { Squares: SquareState[]; droppedDominoes: DroppedDominoes[] } = snapshot.val()

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
              if (data && data.droppedDominoes) {
                const dominoData = data.droppedDominoes
                setDroppedDominoes(dominoData)
              }
            })
          }
          onValue(playerInfoRef, (snapshot) => {
            const data: { Score: number; Name: string; didDrop: boolean } = snapshot.val()
            const data2: { Disconnected: boolean } = snapshot.val()
            if (data && data.Score && data.Name) {
              const scoreData = data.Score
              const nameData = data.Name
              setPlayerInfos((prevPlayerInfos) => ({
                ...prevPlayerInfos,
                [otherId]: { name: nameData, score: scoreData },
              }))
            }
            if (data2 && data2.Disconnected === true && otherId !== 'gameStarted' && otherId !== 'round') {
              console.log('disc')
              setDiscPlayers(discPlayers + 1)
            }
          })
        })
      }
      if (dataHost && dataHost.Host) {
        setHostId(dataHost.Host)
      }
      if (firstRender) {
        if (dataHost && dataHost.round) {
          setRound(dataHost.round)
        }
        setFirstRender(false)
      }
    })
  }, [])

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
  }, [])

  useEffect(() => {
    setIsDropped(false)
    const playerRef = ref(projectDatabase, `/${room}/doneWithAction`)
    if (uniqueId !== '' && uniqueId === hostId) {
      const updateObject = { [uniqueId]: false }
      update(playerRef, updateObject)
    }
  }, [round])

  useEffect(() => {
    console.log(discPlayers)
    if (discPlayers > 0 && discPlayers === 2) {
      const playersRef = ref(projectDatabase, `/${room}`)
      const playersDisconnectRef = onDisconnect(playersRef)
      playersDisconnectRef.set(null)
      //set(playersRef, null)
    }
  }, [discPlayers])

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
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
  }, [isDropped])

  return (
    <main className="flex h-screen  items-center justify-center font-sans ">
      <div className="flex  items-center justify-center gap-10 bg-purple-700 w-[1000px]">
        <div className="mt-20 flex items-center justify-center  bg-purple-700 h-[640px] gap-0 shadow-md">
          <DndProvider backend={HTML5Backend}>
            <Board uniqueId={uniqueId} room={room} isDropped={isDropped} setIsDropped={setIsDropped} />
          </DndProvider>
        </div>
        <aside className="flex flex-col h-full justify-start gap-2 mb-40">
          {Object.entries(readBoards).map(([playerId, playerSquares]) => (
            <div key={playerId} className="h-auto w-auto grid grid-cols-7 grid-rows-7">
              {playerSquares.map(({ accepts, lastDroppedItem, hasStar }, squareIndex) => (
                <MiniSquare
                  accept={accepts}
                  lastDroppedItem={lastDroppedItem}
                  hasStar={hasStar}
                  index={squareIndex}
                  key={`player-${playerId}-square-${squareIndex}`}
                  droppedDominoes={droppedDominoes}
                />
              ))}
            </div>
          ))}
          <div className="flex flex-col text-xl text-white  items-center text-center">
            <h3 className="col-span-2  text-3xl mb-2">Scores</h3>
            {Object.entries(playerInfos).map(([playerId, { name, score }]) => (
              <div key={playerId} className="border-t-2 w-40 justify-between items-center flex border-gray-200">
                <div>{playerId === uniqueId ? name + ' (you)' : name}</div>
                <div>{score}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
