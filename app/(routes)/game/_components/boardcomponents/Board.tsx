import update from 'immutability-helper'
import { FC, useEffect, useMemo } from 'react'
import { memo, useCallback, useState } from 'react'
import { DominoComponent } from './Domino'
import { Square } from './Square'
import { ItemTypes } from '../../../../_types/ItemTypes'
import { ScoreCounter } from '../ScoreCounter'
import { projectDatabase } from '@/firebase/config'
import { ref, update as up } from 'firebase/database'
import { useMapSetter } from './useMapSetter'
import { BoardProps, SquareState } from '../../../../_components/Interfaces'
import { rowLength, mapLength } from './MapConfig'
import { DominoSetter } from './DominoSetter'
import { TurnLeft, TurnRight } from '@/app/_components/Vectors'
import { DominoPreview } from '../DominoPreview'

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

  const newSquares = useMapSetter({ Squares: Squares, uniqueId: uniqueId, room: room ?? '', victory: victory })

  useEffect(() => {
    if (newSquares.length > 0 && newSquares.some((square) => !square.lastDroppedItem)) setSquares(newSquares)
  }, [uniqueId, newSquares])

  useMemo(() => {
    if (droppedDominoes.length > 0) {
      setDomino(DominoSetter())
      setScore(ScoreCounter(Squares))
    }
  }, [droppedDominoes])

  useEffect(() => {
    if (uniqueId && !victory.current) {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      up(dataRef, { Domino: Domino })
    }
  }, [Domino])

  const isDominoPlacedCorrectly = (index: number) => {
    let adjacentIndex = index
    switch (direction) {
      case 'right':
        adjacentIndex = index
        index = index - 1
        break
      case 'left':
        adjacentIndex = index + 1
        break
      case 'top':
        adjacentIndex = index + rowLength
        break
      case 'down':
        index = index - rowLength
        break
    }
    const adjacentSquare = Squares[adjacentIndex]
    //Since this function runs for all of the squares, check if this is the hovered square
    const isCorrectIndex = sqIndex === index
    //Check if the adjacent square is not out of bounds
    if (isCorrectIndex && adjacentSquare && !adjacentSquare.lastDroppedItem && !Squares[index]?.lastDroppedItem) {
      const isLastColumn = sqIndex % rowLength === rowLength - 1 //Preventing overflow to the other row
      const notWasteLand = adjacentSquare.accepts.includes('D') && Squares[index]?.accepts.includes('D')
      return notWasteLand && (isTurned || !isLastColumn)
    } else return false
  }
  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)
        setOver(true)
        if (Squares[index] && !Squares[index].lastDroppedItem) {
          setLeftSqIndex(isTurned ? index + rowLength : index + 1)
        } else setLeftSqIndex(-1)
      }
    },
    [Squares, isTurned],
  )

  function isValidNeighbour(index: number, targetIndex: number, firstname: string): boolean {
    if (Squares[index - targetIndex]) {
      if (!Squares[index - targetIndex].lastDroppedItem) return false
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
      console.log(index)
      console.log(Squares[index])
      setLeftSqIndex(-1)
      //dominoIndexes.set(index, item)
      if (
        (isTurned ? index < 56 : index % rowLength !== rowLength - 1) &&
        Squares[index] &&
        !Squares[index].lastDroppedItem &&
        !Squares[isTurned ? index + rowLength : index + 1]?.lastDroppedItem &&
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
    if (uniqueId) {
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
    <div className="h-full mt-10 md:mt-6 w-full flex gap-4 relative flex-col">
      <div id="fade-in" className={`md:h-[${mapLength * 10}px] md:w-[${mapLength * 10}px] grid grid-cols-7 grid-rows-7`}>
        {Squares.map(({ accepts, lastDroppedItem, hasStar }, index) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            hasStar={hasStar}
            onDrop={(item) => handleDrop(direction === 'right' ? index - 1 : direction === 'down' ? index - rowLength : index, item)}
            isActive={isActive && over && isDominoPlacedCorrectly(index)}
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

      <div id="fade-in" className="ml-0 md:mt-16 md:ml-10 w-full md:w-[400px] md:h-[200px] h-[200px] flex justify-center items-center relative">
        <div className="h-full w-full justify-center items-center text-white ml-4 text-xl flex relative">
          <button className="absolute top-10 lg:top-14 left-16 md:left-72" onClick={handleLeftTurnClick}>
            <TurnLeft />
          </button>
          <div className="lg:ml-[460px] lg:mb-0 mb-24">
            {window.innerWidth < 640 && <DominoPreview isTurned={isTurned} />}
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

          <button className="absolute top-10 lg:top-14  right-16 md:-right-36" onClick={handleRightTurnClick}>
            <TurnRight />
          </button>
        </div>
      </div>
    </div>
  )
})

export default Board
