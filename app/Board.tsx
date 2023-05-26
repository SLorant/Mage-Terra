import update from 'immutability-helper'
import { FC, useEffect } from 'react'
import { memo, useCallback, useState, useRef, useMemo } from 'react'
import { Domino } from './Domino'
import { Square } from './Square'
import { ItemTypes } from './ItemTypes'
import Image from 'next/image'

interface SquareState {
  accepts: string[]
  lastDroppedItem: any
}

interface DominoState {
  firstname: string
  secondname: string
  img: string
  secondimg: string
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
    { firstname: 'F', secondname: 'C', img: '/kep1.png', secondimg: '/kep3.jpg' },
    { firstname: 'W', secondname: 'F', img: '/kep2.jpg', secondimg: '/kep1.png' },
    { firstname: 'C', secondname: 'W', img: '/kep3.jpg', secondimg: '/kep2.jpg' },
  ])

  const [droppedDominoNames, setDroppedDominoNames] = useState<string[]>([])

  function isDropped(DominoName: string) {
    return droppedDominoNames.indexOf(DominoName) > -1
  }

  useEffect(() => {
    // Generate a random index for the initial square to be filled
    const randomIndex = Math.floor(Math.random() * initialSquares.length)
    const randomIndex2 = Math.floor(Math.random() * initialSquares.length)
    const specificIndexes = [64, 65, 63, 74, 75, 76] // Specific indexes to set with empty values
    // Generate a random item
    const randomItemIndex = Math.floor(Math.random() * Dominoes.length)
    const randomItem = Dominoes[randomItemIndex]

    // Update the initial square with the random item

    const newSquares = update(Squares, {
      [randomIndex]: { lastDroppedItem: { $set: randomItem } },
      [64]: { accepts: { $set: [] } },
      [65]: { accepts: { $set: [] } },
      [63]: { accepts: { $set: [] } },
      [74]: { accepts: { $set: [] } },
      [75]: { accepts: { $set: [] } },
      [76]: { accepts: { $set: [] } },
    })

    setSquares(newSquares)
  }, [])

  const [isActive, setIsActive] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const [leftSqIndex, setLeftSqIndex] = useState<number>(-1)
  // const [fillIndex, setFillIndex] = useState<number>(0)

  const isDominoPlacedCorrectly = (index: number) => {
    const square = Squares[index]
    return (
      !square.lastDroppedItem &&
      (sqIndex === index - 1 || sqIndex === index) &&
      sqIndex % 10 !== 9 &&
      (leftSqIndex === +1 || leftSqIndex === index + 1) &&
      Squares[index + 1].accepts.includes('F')
    )
  }

  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)
        setOver(true)
        setLeftSqIndex(index + 1)
        if (Squares[index].lastDroppedItem == null) setLeftSqIndex(index + 1)
        else setLeftSqIndex(-1)
      }
    },
    [Squares],
  )
  const [isTurned, setIsTurned] = useState(false)
  function isValidNeighbour(index: number, targetIndex: number, firstname: string): boolean {
    if (Squares[index - targetIndex] !== undefined) {
      if (Squares[index - targetIndex].lastDroppedItem == null) return false
      else return Squares[index - targetIndex].lastDroppedItem.firstname == firstname
    } else return false
  }

  function areNeighboursValid(index: number, firstname: string, secondname: string): boolean {
    //const fillIndex: number = index + 1
    const fillIndex: number = isTurned ? index + 10 : index + 1

    return (
      isValidNeighbour(index, -10, firstname) ||
      isValidNeighbour(fillIndex, -10, secondname) ||
      isValidNeighbour(index, 10, firstname) ||
      isValidNeighbour(fillIndex, 10, secondname) ||
      isValidNeighbour(index, -1, firstname) ||
      isValidNeighbour(fillIndex, -1, secondname) ||
      isValidNeighbour(index, 1, firstname) ||
      isValidNeighbour(fillIndex, 1, secondname)
    )
  }

  const handleDrop = useCallback(
    (index: number, item: { firstname: string; secondname: string; img: string; secondimg: string }) => {
      let { firstname, secondname, img, secondimg } = item
      //const fillIndex: number = index + 1
      const fillIndex: number = isTurned ? index + 10 : index + 1
      setIsActive(false)
      setLeftSqIndex(-1)

      if (
        index % 10 !== 9 &&
        !Squares[index].lastDroppedItem &&
        !Squares[index + 1].lastDroppedItem &&
        areNeighboursValid(index, firstname, secondname)
      ) {
        const newSquares = update(Squares, {
          [fillIndex]: { lastDroppedItem: { $set: { firstname: secondname, img: secondimg } } },
          [index]: { lastDroppedItem: { $set: item } },
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
        {Dominoes.map(({ firstname, secondname, img, secondimg }, index) => (
          <Domino
            firstname={firstname}
            secondname={secondname}
            isDropped={isDropped(firstname)}
            key={index}
            setIsActive={setIsActive}
            img={img}
            secondimg={secondimg}
            isTurned={isTurned}
            setIsTurned={setIsTurned}
          />
        ))}
      </div>
    </div>
  )
})

export default Board
