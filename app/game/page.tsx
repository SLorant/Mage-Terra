'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue } from 'firebase/database'
import { useState, useEffect } from 'react'
import { ItemTypes } from '../ItemTypes'
import { MiniSquare } from './MiniSquare'
import { v4 as uuidv4 } from 'uuid'
import { useSearchParams } from 'next/navigation'
import { MapSetter } from './MapSetter'

interface SquareState {
  accepts: string[]
  lastDroppedItem: any
  hasStar: boolean
}

export default function Home() {
  const initialSquares: SquareState[] = Array.from({ length: 64 }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))

  const [readSquares, setReadSquares] = useState<SquareState[]>(initialSquares)
  //const [readBoards, setReadBoards] = useState<SquareState[][]>([initialSquares])
  const [readBoards, setReadBoards] = useState<{ [playerId: string]: SquareState[] }>({})
  const [readScores, setReadScores] = useState<number[]>([])
  const [readNames, setReadNames] = useState<string[]>([])

  type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([])
  const [uniqueId, setUniqueId] = useState('')
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')

  // Save the unique ID in local storage
  let otherPlayerIds: Array<string>
  const [isChanged, setIsChanged] = useState<boolean>(false)

  useEffect(() => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    if (storedUniqueId) {
      setUniqueId(storedUniqueId)
    } else {
      const newUniqueId = uuidv4()
      setUniqueId(newUniqueId)
      localStorage.setItem('uniqueId', newUniqueId)
    }

    const playersRef = ref(projectDatabase, `/${room}`)
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const playerIds = Object.keys(data)
        otherPlayerIds = playerIds.filter((id) => id !== localStorage.getItem('uniqueId'))
        // Maybe I could do this on the main page instead
        const initialReadBoards = otherPlayerIds.reduce((acc, playerId) => {
          acc[playerId] = []
          return acc
        }, {} as { [playerId: string]: SquareState[] }) // Type assertion

        setReadBoards(initialReadBoards)

        otherPlayerIds.forEach((otherId) => {
          const dataRef = ref(projectDatabase, `/${room}/${otherId}/Board`)
          const dataRef2 = ref(projectDatabase, `/${room}/${otherId}`)
          onValue(dataRef, (snapshot) => {
            setIsChanged(false)
            const data: { Squares: SquareState[]; droppedDominoes: DroppedDominoes[] } = snapshot.val()

            if (data && data.Squares) {
              const squaresData = data.Squares.map((square) => ({
                accepts: square.accepts,
                lastDroppedItem: square.lastDroppedItem,
                hasStar: square.hasStar,
              }))
              setReadSquares(squaresData)
              //setReadBoards((prevStoredSquares) => [...prevStoredSquares, squaresData])
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
          onValue(dataRef2, (snapshot) => {
            setIsChanged(false)
            const data: { Score: number; Name: string } = snapshot.val()
            if (data && data.Score) {
              const scoreData = data.Score
              setReadScores((prevReadScores) => ({
                ...prevReadScores,
                [otherId]: scoreData,
              }))
            }
            if (data && data.Name) {
              const nameData = data.Name
              console.log(nameData)
              setReadNames((prevReadNames) => ({
                ...prevReadNames,
                [otherId]: nameData,
              }))
            }
          })
        })
      }
    })
  }, [isChanged])

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
  }, [])
  console.log(readSquares)
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <div className="items-center flex-col  justify-center">
          <div className="text-5xl mt-0 text-center"> The game</div>
          <div className="mt-20 w-[1100px] bg-blue-300 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board uniqueId={uniqueId} room={room} setIsChanged={setIsChanged} />
            </DndProvider>
          </div>
        </div>
      </div>
      <div className="flex gap-10">
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
        {Object.entries(readScores).map(([playerId, score]) => (
          <div key={playerId}>{score}</div>
        ))}
        {Object.entries(readNames).map(([playerId, name]) => (
          <div key={playerId}>{name}</div>
        ))}
      </div>
    </main>
  )
}
