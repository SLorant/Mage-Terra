'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, set, onValue, push } from 'firebase/database'
import { useState, useEffect } from 'react'
import { ItemTypes } from '../ItemTypes'
import { MiniSquare } from './MiniSquare'
import { v4 as uuidv4 } from 'uuid'
import { useSearchParams } from 'next/navigation'

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
  type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([])
  const [uniqueId, setUniqueId] = useState('')
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')

  // Save the unique ID in local storage
  let otherPlayerIds: Array<string>
  const [otherPlayerId, setOtherPlayerId] = useState<Array<string>>([])

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}`)
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const playerIds = Object.keys(data)
        // Exclude the current player's ID
        otherPlayerIds = playerIds.filter((id) => id !== localStorage.getItem('uniqueId'))
        setOtherPlayerId(otherPlayerIds)
        // Now you have the other player IDs
        console.log(otherPlayerIds)
        console.log(localStorage.getItem('uniqueId'))
      }
    })
  }, [])

  useEffect(() => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    if (storedUniqueId) {
      setUniqueId(storedUniqueId)
    } else {
      const newUniqueId = uuidv4()
      setUniqueId(newUniqueId)
      storedUniqueId = newUniqueId
      localStorage.setItem('uniqueId', newUniqueId)
    }
    console.log(otherPlayerId[0])
    const otherId = otherPlayerIds === undefined ? '' : otherPlayerIds[0]
    // ha a tömb undefined crashel, de amúgy működik, null check viszont nem oldja meg
    const dataRef = ref(projectDatabase, `/${room}/${otherPlayerIds[0]}/Board`)
    onValue(dataRef, (snapshot) => {
      const data: { Squares: SquareState[]; droppedDominoes: DroppedDominoes[] } = snapshot.val()

      if (data && data.Squares) {
        const squaresData = data.Squares.map((square) => ({
          accepts: square.accepts,
          lastDroppedItem: square.lastDroppedItem,
          hasStar: square.hasStar,
        }))
        setReadSquares(squaresData)
      }
      if (data && data.droppedDominoes) {
        const dominoData = data.droppedDominoes
        setDroppedDominoes(dominoData)
      }
    })
  }, [])
  console.log(uniqueId)
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <div className="items-center flex-col  justify-center">
          <div className="text-5xl mt-0 text-center"> The game</div>
          <div className="mt-20 w-[1100px] bg-blue-300 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board uniqueId={uniqueId} room={room} />
            </DndProvider>
          </div>
        </div>
      </div>
      <div className="h-auto w-auto grid grid-cols-8 grid-rows-8">
        {readSquares.map(({ accepts, lastDroppedItem, hasStar }, index) => (
          <MiniSquare accept={accepts} lastDroppedItem={lastDroppedItem} hasStar={hasStar} index={index} key={index} droppedDominoes={droppedDominoes} />
        ))}
      </div>
    </main>
  )
}
