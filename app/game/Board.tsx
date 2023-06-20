import update from 'immutability-helper'
import { FC, useEffect } from 'react'
import { memo, useCallback, useState } from 'react'
import { DominoComponent } from './Domino'
import { Square } from './Square'
import { ItemTypes } from '../ItemTypes'
import { ScoreCounter } from './ScoreCounter'
import { projectDatabase } from '@/firebase/config'
import { onValue, ref, set, update as up } from 'firebase/database'
import { MapSetter } from './MapSetter'
import { BoardProps, DominoState, SquareState } from './Interfaces'

export const Board: FC<BoardProps> = memo(function Board({ uniqueId, room, setIsChanged }) {
  console.log(uniqueId)
  const initialSquares: SquareState[] = Array.from({ length: 64 }).map(() => ({
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
  const nameArray: string[] = ['F', 'W', 'C']
  const imgArray: string[] = ['/cave-05.svg', '/swamp-02.svg', '/mountains-01.svg']

  const [droppedDominoNames, setDroppedDominoNames] = useState<string[]>([])

  type DroppedDomino = [number, number, DominoState]
  type DroppedDomino2 = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDomino[]>([])
  const [droppedDominoes2, setDroppedDominoes2] = useState<DroppedDomino2[]>([])
  const [round, setRound] = useState<number>(1)

  /* function isDropped(DominoName: string) {
    return droppedDominoNames.indexOf(DominoName) > -1
  } */
  /* function isDropped() {
    return droppedDominoNames.length > 0
  } */
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [isTurned, setIsTurned] = useState(false)

  useEffect(() => {
    const newSquares = MapSetter(Squares)
    setSquares(newSquares)
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
        (sqIndex === index - 8 || sqIndex === index) &&
        sqIndex < 56 &&
        (leftSqIndex === +8 || leftSqIndex === index + 8) &&
        Squares[index + 8].accepts.includes('D')
      )
    } else {
      return (
        !square.lastDroppedItem &&
        (sqIndex === index - 1 || sqIndex === index) &&
        sqIndex % 8 !== 7 &&
        (leftSqIndex === +1 || leftSqIndex === index + 1) &&
        Squares[index + 1].accepts.includes('D')
      )
    }
  }

  const handleIsOverChange = useCallback(
    (index: number, isOver: boolean) => {
      if (isOver) {
        setSqIndex(index)

        setOver(true)
        if (Squares[index].lastDroppedItem == null) setLeftSqIndex(isTurned ? index + 8 : index + 1)
        else setLeftSqIndex(-1)
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
    const fillIndex: number = isTurned ? index + 8 : index + 1
    const verticalNeighborValid =
      isValidNeighbour(index, -8, firstname) ||
      isValidNeighbour(fillIndex, -8, secondname) ||
      isValidNeighbour(index, 8, firstname) ||
      isValidNeighbour(fillIndex, 8, secondname)
    const horizontalNeighborValid =
      isValidNeighbour(index, -1, firstname) ||
      isValidNeighbour(fillIndex, -1, secondname) ||
      isValidNeighbour(index, 1, firstname) ||
      isValidNeighbour(fillIndex, 1, secondname)

    if (isValidNeighbour(index, 1, firstname) && index % 8 === 0 && !verticalNeighborValid) {
      return false
    }
    return verticalNeighborValid || horizontalNeighborValid
  }

  const handleDrop = useCallback(
    (index: number, item: { firstname: string; secondname: string; img: string; secondimg: string }) => {
      let { firstname, secondname, /*img*/ secondimg } = item
      setIsChanged(true)
      const fillIndex: number = isTurned ? index + 8 : index + 1
      setIsActive(false)
      setIsDropped(true)
      setLeftSqIndex(-1)
      //dominoIndexes.set(index, item)
      if (
        (isTurned ? index < 56 : index % 8 !== 7) &&
        !Squares[index].lastDroppedItem &&
        !Squares[isTurned ? index + 8 : index + 1].lastDroppedItem &&
        areNeighboursValid(index, firstname, secondname) &&
        Squares[fillIndex].accepts.includes('D')
      ) {
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

  const handleTurnClick = () => {
    setIsTurned(!isTurned)
    console.log(Squares)
  }

  useEffect(() => {
    if (uniqueId !== '') {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Board`)
      const dataRef2 = ref(projectDatabase, `/${room}/${uniqueId}`)
      const squaresData = Squares.map((square) => ({
        accepts: square.accepts,
        lastDroppedItem: square.lastDroppedItem,
        hasStar: square.hasStar,
      }))
      const updatedData = {
        Squares: squaresData,
        droppedDominoes: droppedDominoes2,
        didDrop: true,
      }
      set(dataRef, updatedData)
      up(dataRef2, { Score: score })
      const dataRef3 = ref(projectDatabase, `/${room}/round`)
      onValue(dataRef3, (snapshot) => {
        const data = snapshot.val()
        console.log(data)
      })
    }
  }, [Squares, score])

  const handlePlayGame = () => {
    const dataRef = ref(projectDatabase, `/${room}`)
    let count = 0
    onValue(dataRef, (snapshot) => {
      const data: { round: number } = snapshot.val()
      if (data && data.round) {
        count = data.round
        setRound(data.round)
      }
    })
    up(dataRef, { round: count + 1 })
  }
  useEffect(() => {
    setIsDropped(false)
  }, [round])

  return (
    <div className="h-full w-full flex gap-2">
      <div className="h-[640px] w-[640px] grid grid-cols-8 grid-rows-8">
        {Squares.map(({ accepts, lastDroppedItem, hasStar }, index) => (
          <Square
            accept={accepts}
            lastDroppedItem={lastDroppedItem}
            hasStar={hasStar}
            onDrop={(item) => handleDrop(index, item)}
            isActive={isActive && over && isDominoPlacedCorrectly(index) && !Squares[isTurned ? index + 8 : index + 1].lastDroppedItem}
            setIsActive={setIsActive}
            onIsOverChange={(index, isOver) => handleIsOverChange(index, isOver)}
            index={index}
            key={index}
            leftSqIndex={leftSqIndex} // Pass the left square index
            droppedDominoes2={droppedDominoes2}
            isTurned={isTurned}
          />
        ))}
      </div>

      <div className="w-40  flex justify-center items-center flex-col ">
        <div className="text-xl  text-white">Your score: {score}</div>
        <DominoComponent
          firstname={Domino.firstname}
          secondname={Domino.secondname}
          isDropped={isDropped}
          setIsActive={setIsActive}
          img={Domino.img}
          secondimg={Domino.secondimg}
          isTurned={isTurned}
        />
        <div className="text-white ml-10 mt-4 text-xl flex gap-6">
          <button className="" onClick={handleMirrorClick}>
            Mirror
          </button>
          <button className="" onClick={handleTurnClick}>
            Turn
          </button>
        </div>
        <button onClick={handlePlayGame}>Next round</button>
      </div>
    </div>
  )
})

export default Board
