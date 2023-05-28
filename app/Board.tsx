import update from 'immutability-helper'
import { FC, useEffect } from 'react'
import { memo, useCallback, useState, useRef, useMemo } from 'react'
import { DominoComponent } from './Domino'
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
  Domino: DominoSpec[]
}

const initialSquares: SquareState[] = Array.from({ length: 100 }).map(() => ({
  accepts: [ItemTypes.FOREST, ItemTypes.WATER, ItemTypes.CITY],
  lastDroppedItem: null,
}))

export const Board: FC = memo(function Board() {
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)

  const [Domino, setDomino] = useState<DominoState>({
    firstname: 'F',
    secondname: 'C',
    img: '/kep1.png',
    secondimg: '/kep3.jpg',
  })

  const [droppedDominoNames, setDroppedDominoNames] = useState<string[]>([])

  function isDropped(DominoName: string) {
    return droppedDominoNames.indexOf(DominoName) > -1
  }
  const [isTurned, setIsTurned] = useState(false)

  useEffect(() => {
    const specificIndexes = [64, 65, 63, 74, 75, 76] // Specific indexes to set with empty values
    const newSquares = update(Squares, {
      [50]: { lastDroppedItem: { $set: { firstname: 'F', img: '/kep1.png' } } },
      [25]: { lastDroppedItem: { $set: { firstname: 'W', img: '/kep2.jpg' } } },
      [78]: { lastDroppedItem: { $set: { firstname: 'C', img: '/kep3.jpg' } } },
      [64]: { accepts: { $set: [] } },
      [65]: { accepts: { $set: [] } },
      [63]: { accepts: { $set: [] } },
      [74]: { accepts: { $set: [] } },
      [75]: { accepts: { $set: [] } },
      [76]: { accepts: { $set: [] } },
    })
    setSquares(newSquares)
  }, [isTurned])

  /* useEffect(()=>{

  }, [Squares]) */

  const [isActive, setIsActive] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const [leftSqIndex, setLeftSqIndex] = useState<number>(-1)

  // const [fillIndex, setFillIndex] = useState<number>(0)
  const handleMirrorClick = () => {
    const tempimg: string = Domino.img
    const tempname: string = Domino.firstname
    const newDomino = update(Domino, {
      $set: {
        firstname: Domino.secondname,
        img: Domino.secondimg,
        secondname: tempname,
        secondimg: tempimg,
      },
    })
    setDomino(newDomino)
  }

  const isDominoPlacedCorrectly = (index: number) => {
    const square = Squares[index]
    if (isTurned) {
      return (
        !square.lastDroppedItem &&
        (sqIndex === index - 10 || sqIndex === index) &&
        sqIndex < 90 &&
        (leftSqIndex === +10 || leftSqIndex === index + 10) &&
        Squares[index + 10].accepts.includes('F')
      )
    } else {
      return (
        !square.lastDroppedItem &&
        (sqIndex === index - 1 || sqIndex === index) &&
        sqIndex % 10 !== 9 &&
        (leftSqIndex === +1 || leftSqIndex === index + 1) &&
        Squares[index + 1].accepts.includes('F')
      )
    }
  }

  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)
        setOver(true)
        setLeftSqIndex(isTurned ? index + 10 : index + 1)
        if (Squares[index].lastDroppedItem == null) setLeftSqIndex(isTurned ? index + 10 : index + 1)
        else setLeftSqIndex(-1)
      }
    },
    [Squares],
  )

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
        (isTurned ? index < 90 : index % 10 !== 9) &&
        !Squares[index].lastDroppedItem &&
        !Squares[isTurned ? index + 10 : index + 1].lastDroppedItem &&
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

  const handleTurnClick = () => {
    setIsTurned(!isTurned)
  }
  return (
    <div className="h-full w-full flex gap-10">
      <div className="h-auto w-auto grid grid-cols-10 grid-rows-10">
        {Squares.map(({ accepts, lastDroppedItem }, index) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            onDrop={(item) => handleDrop(index, item)}
            isActive={
              isActive &&
              over &&
              isDominoPlacedCorrectly(index) &&
              !Squares[isTurned ? index + 10 : index + 1].lastDroppedItem
            }
            setIsActive={setIsActive}
            onIsOverChange={(index, isOver) => handleIsOverChange(index, isOver)}
            index={index}
            key={index}
            leftSqIndex={leftSqIndex} // Pass the left square index
          />
        ))}
      </div>
      <button className="mt-10 h-6" onClick={handleMirrorClick}>
        Mirror
      </button>
      <div className="w-28 flex justify-center items-center flex-col ">
        <DominoComponent
          firstname={Domino.firstname}
          secondname={Domino.secondname}
          isDropped={isDropped(Domino.firstname)}
          setIsActive={setIsActive}
          img={Domino.img}
          secondimg={Domino.secondimg}
          isTurned={isTurned}
        />
      </div>
      <button className="mt-10 h-6" onClick={handleTurnClick}>
        Turn
      </button>
    </div>
  )
})

export default Board
