'use client'
import { useState } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'

export default function Home() {
  const rows = 10
  const cols = 10

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)

  const generateCells = (): JSX.Element[] => {
    let cells: JSX.Element[] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let color: string = (row + col) % 2 === 0 ? 'bg-white' : 'bg-gray-200'
        let selected: boolean = selectedCell !== null && selectedCell[0] === row && selectedCell[1] === col
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`h-16 w-16  ${color}  ${selected ? 'ring-2 ring-yellow-400 shadow-lg z-50' : ''}`}
            onClick={() => setSelectedCell([row, col])}></div>,
        )
      }
    }
    return cells
  }
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <div className="items-center flex-col  justify-center">
          <div className="text-5xl mt-0 text-center"> The game</div>
          <div className="mt-20 w-[900px] bg-blue-300 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board />
            </DndProvider>
          </div>
        </div>
      </div>
    </main>
  )
}
