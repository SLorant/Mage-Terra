import update from 'immutability-helper'
import { FC, useEffect, useMemo, useRef } from 'react'
import { memo, useCallback, useState } from 'react'
import { DominoComponent } from './Domino'
import { Square } from './Square'
import { ItemTypes } from '../ItemTypes'
import { ScoreCounter } from './ScoreCounter'
import { projectDatabase } from '@/firebase/config'
import { ref, update as up } from 'firebase/database'
import { useMapSetter } from './useMapSetter'
import { BoardProps, SquareState } from './Interfaces'
import { rowLength, mapLength } from './MapConfig'
import { DominoSetter } from './DominoSetter'
import { TurnLeft, TurnRight } from '@/utils/Vectors'

export const Board: FC<BoardProps> = memo(function Board({ uniqueId, room, isDropped, setIsDropped, Domino, setDomino, victory }) {
  const initialSquares: SquareState[] = Array.from({ length: mapLength }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)

  type DroppedDomino = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDomino[]>([])
  const [direction, setDirection] = useState<string>('left')
  const [isTurned, setIsTurned] = useState(false)
  const [turnCount, setTurnCount] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [isActive, setIsActive] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const [leftSqIndex, setLeftSqIndex] = useState<number>(-1)
  //const [mapLoaded, setMapLoaded] = useState(false)
  const mapLoaded = useRef(false)
  //const [newSquares, setNewSquares] = useState<SquareState[]>([])
  //setNewSquares(useMapSetter({ Squares: Squares, uniqueId: uniqueId, room: room ?? '', mapLoaded:mapLoaded }))
  const newSquares = useMapSetter({ Squares: Squares, uniqueId: uniqueId, room: room ?? '', victory: victory })

  //const newSquares = useMapSetter({ Squares: Squares, uniqueId: uniqueId, room: room ?? '', mapLoaded: mapLoaded })
  useEffect(() => {
    console.log(newSquares)
    const isStartingMap: boolean = Squares.filter((square) => square.lastDroppedItem !== null).length < 5
    if (newSquares.length > 0 && newSquares.some((square) => square.lastDroppedItem !== null)) setSquares(newSquares)
  }, [uniqueId, newSquares])

  useMemo(() => {
    if (droppedDominoes.length > 0) {
      setDomino(DominoSetter())
      setScore(ScoreCounter(Squares))
    }
  }, [droppedDominoes])

  useEffect(() => {
    if (uniqueId !== '' && !victory.current) {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      up(dataRef, { Domino: Domino })
    }
  }, [Domino])

  const isDominoPlacedCorrectly = (index: number) => {
    if (isTurned) {
      const adjacentSquare = direction == 'top' ? Squares[index + rowLength] : Squares[index]
      return (
        adjacentSquare &&
        !adjacentSquare.lastDroppedItem &&
        sqIndex === index &&
        sqIndex < mapLength - rowLength &&
        leftSqIndex === index + rowLength &&
        adjacentSquare.accepts.includes('D')
      )
    } else {
      const adjacentSquare = direction == 'left' ? Squares[index + 1] : Squares[index]
      return (
        adjacentSquare &&
        !adjacentSquare.lastDroppedItem &&
        sqIndex === index &&
        sqIndex % rowLength !== rowLength - 1 &&
        leftSqIndex === index + 1 &&
        adjacentSquare.accepts.includes('D')
      )
    }
  }
  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)
        setOver(true)
        if (Squares[index] && Squares[index].lastDroppedItem == null) {
          setLeftSqIndex(isTurned ? index + rowLength : index + 1)
        } else setLeftSqIndex(-1)
      }
    },
    [Squares, isTurned],
  )

  function isValidNeighbour(index: number, targetIndex: number, firstname: string): boolean {
    if (Squares[index - targetIndex] !== undefined) {
      if (Squares[index - targetIndex].lastDroppedItem == null) return false
      else return Squares[index - targetIndex].lastDroppedItem.firstname.includes(firstname)
    } else return false
  }

  function areNeighboursValid(index: number, firstname: string, secondname: string): boolean {
    const fillIndex: number = isTurned ? index + rowLength : index + 1
    const verticalNeighborValid =
      isValidNeighbour(index, -rowLength, firstname) ||
      isValidNeighbour(fillIndex, -rowLength, secondname) ||
      isValidNeighbour(index, rowLength, firstname) ||
      isValidNeighbour(fillIndex, rowLength, secondname)
    const horizontalNeighborValid =
      isValidNeighbour(index, -1, firstname) ||
      isValidNeighbour(fillIndex, -1, secondname) ||
      isValidNeighbour(index, 1, firstname) ||
      isValidNeighbour(fillIndex, 1, secondname)

    if (
      (isValidNeighbour(index, 1, firstname) || isValidNeighbour(fillIndex, 1, secondname)) &&
      index % rowLength === 0 &&
      !verticalNeighborValid &&
      !isValidNeighbour(fillIndex, -1, secondname) &&
      !isValidNeighbour(index, -1, firstname)
    ) {
      return false
    }
    return verticalNeighborValid || horizontalNeighborValid
  }

  const handleDrop = useCallback(
    (index: number, item: { firstname: string; secondname: string; img: string; secondimg: string }) => {
      let { firstname, secondname, /*img*/ secondimg } = item

      const fillIndex: number = isTurned ? index + rowLength : index + 1
      setIsActive(false)

      setLeftSqIndex(-1)
      //dominoIndexes.set(index, item)
      if (
        (isTurned ? index < 56 : index % rowLength !== rowLength - 1) &&
        Squares[index] &&
        !Squares[index].lastDroppedItem &&
        !Squares[isTurned ? index + rowLength : index + 1].lastDroppedItem &&
        areNeighboursValid(index, firstname, secondname) &&
        Squares[fillIndex].accepts.includes('D') &&
        Squares[index].accepts.includes('D')
      ) {
        setIsDropped(true)
        setDroppedDominoes([...droppedDominoes, [index, fillIndex]])
        const newSquares = update(Squares, {
          [fillIndex]: { lastDroppedItem: { $set: { firstname: secondname, img: secondimg } } },
          [index]: { lastDroppedItem: { $set: item } },
        })
        setSquares(newSquares)
      }
    },
    [Squares, isTurned],
  )

  const MirrorDomino = () => {
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

  const handleRightTurnClick = () => {
    setIsTurned(!isTurned)
    if (turnCount === 1 || turnCount === 3) {
      MirrorDomino()
    }

    setTurnCount((turnCount + 1) % 4)
  }
  const handleLeftTurnClick = () => {
    setIsTurned(!isTurned)
    if (turnCount === 0 || turnCount === 2) {
      MirrorDomino()
    }
    setTurnCount((turnCount + 1) % 4)
  }
  useEffect(() => {
    if (uniqueId !== '') {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const squaresData = Squares.map((square) => ({
        accepts: square.accepts,
        lastDroppedItem: square.lastDroppedItem,
        hasStar: square.hasStar,
      }))
      const updatedData = {
        Squares: squaresData,
        droppedDominoes: droppedDominoes,
      }
      up(dataRef, updatedData)
      up(dataRef, { Score: score })
    }
  }, [Squares])

  return (
    <div className="h-full w-full flex gap-2 relative">
      <div id="fade-in" className={`h-[${mapLength * 10}px] w-[${mapLength * 10}px] grid grid-cols-7 grid-rows-7`}>
        {Squares.map(({ accepts, lastDroppedItem, hasStar }, index) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            hasStar={hasStar}
            onDrop={(item) => handleDrop(direction === 'right' ? index - 1 : direction === 'down' ? index - rowLength : index, item)}
            isActive={isActive && over && isDominoPlacedCorrectly(direction === 'right' ? index - 1 : direction === 'down' ? index - rowLength : index)}
            setIsActive={setIsActive}
            onIsOverChange={(index, isOver) => handleIsOverChange(index, isOver)}
            index={index}
            key={index}
            leftSqIndex={leftSqIndex} // Pass the left square index
            droppedDominoes={droppedDominoes}
            isTurned={isTurned}
            direction={direction}
            isLeftSquareActive={
              leftSqIndex === (direction === 'left' || direction === 'top' ? index : direction === 'down' ? index + rowLength : index + 1) &&
              !Squares[direction === 'left' || direction === 'top' ? index : direction === 'down' ? index + rowLength : index + 1].lastDroppedItem
            }
          />
        ))}
      </div>

      <div id="fade-in" className="w-28 ml-10 w-[400px] h-[200px] flex justify-center items-center  absolute -bottom-[160px] -right-96">
        <div className="text-white ml-4 mt-4 text-xl flex">
          <button className="absolute top-20 left-20" onClick={handleLeftTurnClick}>
            <TurnLeft />
          </button>
          <div>
            <DominoComponent
              firstname={Domino.firstname ?? 'Dungeon'}
              secondname={Domino.secondname ?? 'Mt'}
              isDropped={isDropped}
              img={Domino.img ?? '/dungeon-05.webp'}
              secondimg={Domino.secondimg ?? '/mountain-01.webp'}
              isTurned={isTurned}
              setIsActive={setIsActive}
              setDirection={setDirection}
              setLeftSqIndex={setLeftSqIndex}
            />
          </div>

          <button className="absolute top-20 right-16" onClick={handleRightTurnClick}>
            <TurnRight />
          </button>
        </div>
      </div>
    </div>
  )
})

export default Board
