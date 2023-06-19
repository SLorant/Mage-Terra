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

  interface PlayerInfo {
    name: string
    score: number
  }

  const [playerInfos, setPlayerInfos] = useState<{ [key: string]: PlayerInfo }>({})

  /* const [playerInfos, setPlayerInfos] = useState<number[]>([]) */
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

        playerIds.forEach((otherId) => {
          const dataRef = ref(projectDatabase, `/${room}/${otherId}/Board`)
          const dataRef2 = ref(projectDatabase, `/${room}/${otherId}`)
          if (otherId !== localStorage.getItem('uniqueId')) {
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
          }
          onValue(dataRef2, (snapshot) => {
            setIsChanged(false)
            const data: { Score: number; Name: string } = snapshot.val()
            if (data && data.Score && data.Name) {
              const scoreData = data.Score
              const nameData = data.Name
              setPlayerInfos((prevPlayerInfos) => ({
                ...prevPlayerInfos,
                [otherId]: { name: nameData, score: scoreData },
              }))
            }
            /*  if (data && data.Name) {
              const nameData = data.Name
              setReadNames((prevReadNames) => ({
                ...prevReadNames,
                [otherId]: nameData,
              }))
            }*/
            console.log(playerInfos)
          })
        })
      }
    })
  }, [isChanged])

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
    console.log(playerInfos)
  }, [])
  /*  const combinedArray = playerInfos.map((score, index) => ({
    name: readNames[index],
    score: score,
  }))
  console.log(combinedArray) */
  return (
    <main className="flex h-screen  items-center justify-center">
      <div className="h-full w-2/3 flex items-center justify-center gap-20">
        <div className="items-center flex-col  justify-center">
          <div className="mt-20 w-[900px] bg-purple-700 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board uniqueId={uniqueId} room={room} setIsChanged={setIsChanged} />
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
          {/*   {Object.entries(readNames).map(([playerId, name]) => (
            <div key={playerId} className="border-y-2 border-gray-200">
              {name}
            </div>
          ))} */}
          {Object.entries(playerInfos).map(([playerId, { name, score }]) => (
            <div key={playerId} className="border-t-2 w-40 justify-between items-center flex border-gray-200">
              <div>{playerId === uniqueId ? name + ' (you)' : name}</div>
              <div>{score}</div>
            </div>
          ))}
        </div>
      </aside>
    </main>
  )
}
