import update from 'immutability-helper'
import { FC, useEffect } from 'react'
import { memo, useCallback, useState, useRef, useMemo } from 'react'
import { Domino } from './Domino'
import { Square } from './Square'
import { ItemTypes } from './ItemTypes'
import { useDrop } from 'react-dnd'

interface SquareState {
  accepts: string[]
  lastDroppedItem: any
}

interface DominoState {
  name: string
  type: string
}

export interface SquareSpec {
  accepts: string[]
  lastDroppedItem: any
}
export interface DominoSpec {
  name: string
  type: string
}
export interface BoardState {
  droppedDominoNames: string[]
  Squares: SquareSpec[]
  Dominoes: DominoSpec[]
}

const initialSquares: SquareState[] = Array.from({ length: 100 }).map(() => ({
  accepts: [ItemTypes.WATER, ItemTypes.FOREST, ItemTypes.CITY],
  lastDroppedItem: null,
}))

export const Board: FC = memo(function Board() {
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)

  const [Dominoes] = useState<DominoState[]>([
    { name: 'F', type: ItemTypes.FOREST },
    { name: 'W', type: ItemTypes.WATER },
    { name: 'C', type: ItemTypes.CITY },
  ])

  const [droppedDominoNames, setDroppedDominoNames] = useState<string[]>([])

  function isDropped(DominoName: string) {
    return droppedDominoNames.indexOf(DominoName) > -1
  }

  const [activeSquareIndex, setActiveSquareIndex] = useState<number | null>(null)
  const [activeSquare, setActiveSquare] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const handleIsOverChange = useCallback((index: number, isOver: boolean) => {
    if (isOver) {
      // Perform any necessary operations when isOver is true
      console.log(`Square ${index} is over`)
      setSqIndex(index)
      setOver(true)
    }
  }, [])

  const handleDrop = useCallback(
    (index: number, item: { name: string }) => {
      let { name } = item
      setActiveSquareIndex(index)
      console.log(activeSquareIndex)
      const fillIndex: number = index + 1
      const newSquares = [...Squares]

      // Update the Square state
      if (fillIndex !== null) {
        newSquares[fillIndex].lastDroppedItem = {
          name: 'FOREST',
        }
      }
      setDroppedDominoNames(update(droppedDominoNames, name ? { $push: [name] } : { $push: [] }))
      setSquares(
        update(newSquares, {
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        }),
      )
    },
    [droppedDominoNames, Squares],
  )
  return (
    <div className="h-full w-full flex gap-10">
      <div className="h-auto w-auto grid grid-cols-10 grid-rows-10">
        {Squares.map(({ accepts, lastDroppedItem }, index, cursorPosition) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            onDrop={(item) => handleDrop(index, item)}
            isActive={activeSquare && over && (sqIndex == index - 1 || sqIndex == index)}
            setIsActive={setActiveSquare}
            //onIsOverChange={handleIsOverChange}
            onIsOverChange={(index, isOver) => handleIsOverChange(index, isOver)} // Pass the index along with isOver
            index={index} // Pass the index as a prop
            key={index}
          />
        ))}
      </div>
      <div className="w-28 flex justify-center items-center flex-col ">
        {Dominoes.map(({ name, type }, index) => (
          <Domino name={name} type={type} isDropped={isDropped(name)} key={index} />
        ))}
      </div>
    </div>
  )
})

export default Board
