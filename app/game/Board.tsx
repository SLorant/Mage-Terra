import update from 'immutability-helper'
import { FC, useEffect, useRef } from 'react'
import { memo, useCallback, useState } from 'react'
import { DominoComponent } from './Domino'
import { Square } from './Square'
import { ItemTypes } from '../ItemTypes'
import { ScoreCounter } from './ScoreCounter'
import { projectDatabase } from '@/firebase/config'
import { onValue, ref, set, update as up } from 'firebase/database'
import { MapSetter } from './MapSetter'
import { BoardProps, DominoState, SquareState } from './Interfaces'
import { rowLength, mapLength } from './MapConfig'

export const Board: FC<BoardProps> = memo(function Board({ uniqueId, room, isDropped, setIsDropped }) {
  const initialSquares: SquareState[] = Array.from({ length: mapLength }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)

  const [Domino, setDomino] = useState<DominoState>({
    firstname: 'F',
    secondname: 'C',
    img: '/cave-05.svg',
    secondimg: '/mountains-01.svg',
  })
  const nameArray: string[] = ['Cave', 'Swamp', 'Mt', 'City', 'Field']
  const imgArray: string[] = ['/cave-05.svg', '/swamp-02.svg', '/mountains-01.svg', '/village-01.svg', '/field2-01.svg']

  const [droppedDominoNames, setDroppedDominoNames] = useState<string[]>([])

  type DroppedDomino = [number, number, DominoState]
  type DroppedDomino2 = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDomino[]>([])
  const [droppedDominoes2, setDroppedDominoes2] = useState<DroppedDomino2[]>([])
  const [direction, setDirection] = useState<string>('left')
  const [firstRender, setFirstRender] = useState(true)
  /* function isDropped(DominoName: string) {
    return droppedDominoNames.indexOf(DominoName) > -1
  } */
  /* function isDropped() {
    return droppedDominoNames.length > 0
  } */

  const [isTurned, setIsTurned] = useState(false)
  const [turnCount, setTurnCount] = useState<number>(0)

  useEffect(() => {
    if (firstRender) {
      const newSquares = MapSetter(Squares)
      setSquares(newSquares)
    }
  }, [isTurned])

  useEffect(() => {
    const randomItemIndex = Math.floor(Math.random() * nameArray.length)
    const randomItemIndex2 = Math.floor(Math.random() * nameArray.length)
    const [randomName, randomName2] = [nameArray[randomItemIndex], nameArray[randomItemIndex2]]
    const [randomImg, randomImg2] = [imgArray[randomItemIndex], imgArray[randomItemIndex2]]
    setDomino({ firstname: randomName, img: randomImg, secondname: randomName2, secondimg: randomImg2 })
  }, [droppedDominoNames])

  const [score, setScore] = useState<number>(0)
  useEffect(() => {
    setScore(ScoreCounter(Squares))
  }, [droppedDominoes])

  const [isActive, setIsActive] = useState<boolean>(false)
  const [over, setOver] = useState<boolean>(false)
  const [sqIndex, setSqIndex] = useState<number>(0)
  const [leftSqIndex, setLeftSqIndex] = useState<number>(-1)

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
    [Squares],
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
        setDroppedDominoes([...droppedDominoes, [index, fillIndex, item]])
        setDroppedDominoes2([...droppedDominoes2, [index, fillIndex]])
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
  //let firstRender = useRef(true)

  useEffect(() => {
    if (uniqueId !== '') {
      const boardRef = ref(projectDatabase, `/${room}/${uniqueId}/Board`)
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      if (firstRender) {
        onValue(dataRef, (snapshot) => {
          const data: { Score: number; didDrop: boolean } = snapshot.val()
          if (data && data.Score && data.didDrop) {
            //setScore(data.Score)
            setIsDropped(data.didDrop)
          }
          onValue(boardRef, (snapshot) => {
            const data: { Squares: any; droppedDominoes: DroppedDomino2[] } = snapshot.val()

            //console.log(mappedSquaresData)
            if (data && data.Squares && data.droppedDominoes) {
              const mappedSquaresData = data.Squares
              const updatedSquares = Squares.map((square, index) => ({
                accepts: mappedSquaresData[index].accepts,
                lastDroppedItem: mappedSquaresData[index].lastDroppedItem ? mappedSquaresData[index].lastDroppedItem : null,
                hasStar: mappedSquaresData[index].hasStar,
              }))
              setSquares(updatedSquares)
              setDroppedDominoes2(data.droppedDominoes)
            }
          })
        })
        //firstRender.current = false
        setFirstRender(false)
      }
      if (!firstRender) {
        const squaresData = Squares.map((square) => ({
          accepts: square.accepts,
          lastDroppedItem: square.lastDroppedItem,
          hasStar: square.hasStar,
        }))
        const updatedData = {
          Squares: squaresData,
          droppedDominoes: droppedDominoes2,
        }
        set(boardRef, updatedData)
        up(dataRef, { Score: score, didDrop: isDropped })
      }

      /* const dataRef3 = ref(projectDatabase, `/${room}/round`)
      onValue(dataRef3, (snapshot) => {
        const data = snapshot.val()
      }) */
    }
  }, [Squares, score])
  return (
    <div className="h-full w-full flex gap-2 relative">
      <div className={`h-[${mapLength * 10}px] w-[${mapLength * 10}px] grid grid-cols-7 grid-rows-7`}>
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
            droppedDominoes2={droppedDominoes2}
            isTurned={isTurned}
            direction={direction}
            isLeftSquareActive={
              leftSqIndex === (direction === 'left' || direction === 'top' ? index : direction === 'down' ? index + rowLength : index + 1) &&
              !Squares[direction === 'left' || direction === 'top' ? index : direction === 'down' ? index + rowLength : index + 1].lastDroppedItem
            }
          />
        ))}
      </div>

      <div className="w-28 ml-4 mt-72  flex justify-center items-center flex-col absolute bottom-6 -right-36">
        <DominoComponent
          firstname={Domino.firstname}
          secondname={Domino.secondname}
          isDropped={isDropped}
          img={Domino.img}
          secondimg={Domino.secondimg}
          isTurned={isTurned}
          setIsActive={setIsActive}
          setDirection={setDirection}
          setLeftSqIndex={setLeftSqIndex}
        />
        <div className="text-white ml-10 mt-4 text-xl flex gap-6">
          <button className="" onClick={handleLeftTurnClick}>
            Turn left
          </button>
          <button className="" onClick={handleRightTurnClick}>
            Turn right
          </button>
        </div>
      </div>
    </div>
  )
})

export default Board
