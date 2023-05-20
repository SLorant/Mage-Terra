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
  firstname: string
  secondname: string
  firsttype: string
  secondtype: string
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
  accepts: [ItemTypes.FOREST, ItemTypes.WATER, ItemTypes.CITY],
  lastDroppedItem: null,
}))

export const Board: FC = memo(function Board() {
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)

  const [Dominoes] = useState<DominoState[]>([
    { firstname: 'F', secondname: 'C', firsttype: ItemTypes.FOREST, secondtype: ItemTypes.CITY },
    { firstname: 'W', secondname: 'F', firsttype: ItemTypes.WATER, secondtype: ItemTypes.FOREST },
    { firstname: 'C', secondname: 'W', firsttype: ItemTypes.CITY, secondtype: ItemTypes.WATER },
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
        console.log(index)
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

  function isValidNeighbour(index: number, targetIndex: number, firstname: string): boolean {
    if (Squares[index + targetIndex] == undefined || Squares[index - targetIndex] == undefined) return true
    Squares[index - targetIndex].lastDroppedItem !== null
      ? console.log(Squares[index - targetIndex].lastDroppedItem)
      : ''
    console.log(firstname)
    if (Squares[index - targetIndex].lastDroppedItem == null) return false
    else return Squares[index - targetIndex].lastDroppedItem.firstname == firstname
  }

  const handleDrop = useCallback(
    (index: number, item: { firstname: string; secondname: string; firsttype: string; secondtype: string }) => {
      let { firstname, secondname, firsttype, secondtype } = item
      const fillIndex: number = index + 1
      setIsActive(false)
      setLeftSqIndex(-1)

      if (
        index % 10 !== 9 &&
        !Squares[index].lastDroppedItem &&
        !Squares[index + 1].lastDroppedItem &&
        (isValidNeighbour(index, -10, firstname) ||
          isValidNeighbour(fillIndex, -10, secondname) ||
          isValidNeighbour(index, 10, firstname) ||
          isValidNeighbour(fillIndex, 10, secondname) ||
          isValidNeighbour(index, -1, firstname) ||
          isValidNeighbour(fillIndex, -1, secondname) ||
          isValidNeighbour(index, 1, firstname) ||
          isValidNeighbour(fillIndex, 1, secondname))
        /*(Squares[fillIndex - 10].lastDroppedItem == null ||
          Squares[fillIndex - 10].lastDroppedItem.firstname == firstname ||
          Squares[fillIndex - 10].lastDroppedItem.secondname == secondname) &&
          (Squares[index - 10].lastDroppedItem == null ||
          Squares[ - 10].lastDroppedItem.firstname == firstname ||
          Squares[fillIndex - 10].lastDroppedItem.secondname == secondname)*/
      ) {
        const newSquares = update(Squares, {
          [fillIndex]: { lastDroppedItem: { $set: { firstname: secondname } } },
          [index]: { lastDroppedItem: { $set: item } },
          [index - 1]: { accepts: { $push: [firsttype] } },
          [index + 10]: { accepts: { $push: [firsttype] } },
          [index - 10]: { accepts: { $push: [firsttype] } },
          [fillIndex + 1]: { accepts: { $push: [secondtype] } },
          [fillIndex + 10]: { accepts: { $push: [secondtype] } },
          [fillIndex - 10]: { accepts: { $push: [secondtype] } },
        })
        setSquares(newSquares)

        if (firstname) {
          setDroppedDominoNames(update(droppedDominoNames, { $push: [firstname] }))
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
        {Dominoes.map(({ firstname, firsttype, secondname, secondtype }, index) => (
          <Domino
            firstname={firstname}
            secondname={secondname}
            isDropped={isDropped(firstname)}
            key={index}
            setIsActive={setIsActive}
            firsttype={firsttype}
            secondtype={secondtype}
          />
        ))}
      </div>
    </div>
  )
})

export default Board
