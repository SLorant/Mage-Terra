'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update } from 'firebase/database'
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
  const [playerDrops, setPlayerDrops] = useState<{ [key: string]: boolean }>({})
  /* const [playerInfos, setPlayerInfos] = useState<number[]>([]) */

  type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([])
  const [uniqueId, setUniqueId] = useState('')
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [round, setRound] = useState<number>(1)

  // Save the unique ID in local storage
  let otherPlayerIds: Array<string>

  useEffect(() => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    storedUniqueId && setUniqueId(storedUniqueId)

    const playersRef = ref(projectDatabase, `/${room}`)
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
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
            if (data && data.Score && data.Name) {
              const scoreData = data.Score
              const nameData = data.Name
              setPlayerInfos((prevPlayerInfos) => ({
                ...prevPlayerInfos,
                [otherId]: { name: nameData, score: scoreData },
              }))
            }
            if (data && data.didDrop && otherId !== 'gameStarted' && otherId !== 'round') {
              const dropData = data.didDrop
              setPlayerDrops((prevPlayerDrops) => ({
                ...prevPlayerDrops,
                [otherId]: dropData,
              }))
            } /* else if (data && data.didDrop === undefined && otherId !== 'gameStarted' && otherId !== 'round') {
              console.log('initial playerdrop set')
              setPlayerDrops((prevPlayerDrops) => ({
                ...prevPlayerDrops,
                [otherId]: false,
              }))
            } */
          })
        })
      }
    })
  }, [])

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
  }, [])

  const handlePlayGame = () => {
    const dataRef = ref(projectDatabase, `/${room}`)
    let count = 0
    onValue(dataRef, (snapshot) => {
      const data: { round: number } = snapshot.val()
      if (data && data.round) {
        count = data.round
        setRound(data.round)
      }
    })
    update(dataRef, { round: count + 1 })
  }
  useEffect(() => {
    const allTrue = Object.values(playerDrops).every((value) => value === true)
    const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
    if (allTrue && uniqueId) {
      update(playerRef, { didDrop: false })
      setIsDropped(false)
      const updatedPlayerDrops = Object.fromEntries(Object.entries(playerDrops).map(([key, _]) => [key, false]))
      setPlayerDrops(updatedPlayerDrops)
    }
  }, [playerDrops])

  useEffect(() => {
    setIsDropped(false)
  }, [round])
  return (
    <main className="flex h-screen  items-center justify-center font-sans">
      <div className="h-full w-2/3 flex items-center justify-center gap-20">
        <div className="items-center flex-col  justify-center">
          <button onClick={handlePlayGame}>Next round</button>
          <div className="mt-20 w-[900px] bg-purple-700 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board uniqueId={uniqueId} room={room} isDropped={isDropped} setIsDropped={setIsDropped} />
            </DndProvider>
          </div>
        </div>
      </div>
      <aside className="flex flex-col gap-10">
        {Object.entries(readBoards).map(([playerId, playerSquares]) => (
          <div key={playerId} className="h-auto w-auto grid grid-cols-8 grid-rows-8">
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
        {Object.entries(playerDrops).map(([playerId, drops]) => (
          <div key={playerId} className="border-t-2 w-40 justify-between items-center flex border-gray-200">
            <div>{drops}</div>
          </div>
        ))}
      </aside>
    </main>
  )
}
