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

  const [isActive, setIsActive] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const [leftSqIndex, setLeftSqIndex] = useState<number>(-1)

  const isDominoPlacedCorrectly = (index: number) => {
    const square = Squares[index]
    return (
      !square.lastDroppedItem &&
      (sqIndex === index - 1 || sqIndex === index) &&
      sqIndex % 10 !== 9 &&
      (leftSqIndex === +1 || leftSqIndex === index + 1)
    )
  }

  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)
        setOver(true)
        // Set the left square index
        setLeftSqIndex(index + 1)
        if (Squares[index].lastDroppedItem == null) setLeftSqIndex(index + 1)
        else setLeftSqIndex(-1)
      }
    },
    [Squares],
  )

  const handleDrop = useCallback(
    (index: number, item: { name: string }) => {
      let { name } = item
      const fillIndex: number = index + 1
      setIsActive(false)
      setLeftSqIndex(-1)
      if (index % 10 !== 9 && !Squares[index].lastDroppedItem && !Squares[index + 1].lastDroppedItem) {
        const newSquares = update(Squares, {
          [fillIndex]: {
            lastDroppedItem: {
              $set: { name: 'FOREST' },
            },
          },
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        })
        setSquares(newSquares)

        if (name) {
          setDroppedDominoNames(update(droppedDominoNames, { $push: [name] }))
        }
      }
    },
    [droppedDominoNames, Squares],
  )

  return (
    <div className="h-full w-full flex gap-10">
      <div className="h-auto w-auto grid grid-cols-10 grid-rows-10">
        {Squares.map(({ accepts, lastDroppedItem }, index) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            onDrop={(item) => handleDrop(index, item)}
            isActive={isActive && over && isDominoPlacedCorrectly(index) && !Squares[index + 1].lastDroppedItem}
            setIsActive={setIsActive}
            onIsOverChange={(index, isOver) => handleIsOverChange(index, isOver)}
            index={index}
            key={index}
            leftSqIndex={leftSqIndex} // Pass the left square index
          />
        ))}
      </div>
      <div className="w-28 flex justify-center items-center flex-col ">
        {Dominoes.map(({ name, type }, index) => (
          <Domino name={name} type={type} isDropped={isDropped(name)} key={index} setIsActive={setIsActive} />
        ))}
      </div>
    </div>
  )
})

export default Board
