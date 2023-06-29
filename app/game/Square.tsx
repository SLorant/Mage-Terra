import { FC, useEffect } from 'react'
import { memo, Dispatch, SetStateAction } from 'react'
import { useDrop } from 'react-dnd'
import Image from 'next/image'
import { rowLength } from './MapConfig'

type DroppedDomino2 = [number, number]
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  hasStar: boolean
  onDrop: (item: any) => void
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  index: number
  onIsOverChange: (index: number, isOver: boolean) => void
  leftSqIndex: number
  droppedDominoes2: DroppedDomino2[]
  isTurned: boolean
  direction: string
  isDominoPlacedCorrectly: (index: number) => boolean
}

export const Square: FC<SquareProps> = memo(function Square({
  accept,
  lastDroppedItem,
  hasStar,
  onDrop,
  isActive,
  setIsActive,
  index,
  onIsOverChange,
  leftSqIndex,
  droppedDominoes2,
  isTurned,
  direction,
  isDominoPlacedCorrectly,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  useEffect(() => {
    if (isOver && canDrop) {
      setIsActive(true)
    }
  }, [isOver])

  useEffect(() => {
    onIsOverChange(direction === 'left' || direction === 'top' ? index : direction === 'down' ? index - rowLength : index - 1, isOver) // Notify the Board component of isOver change
  }, [isOver])

  let borderClass = 'border-2'
  for (let i = 0; i < droppedDominoes2.length; i++) {
    if (index === droppedDominoes2[i][0] && index + 1 === droppedDominoes2[i][1]) borderClass = 'border-l-2 border-b-2 border-t-2'
    if (index === droppedDominoes2[i][1] && index - 1 === droppedDominoes2[i][0]) borderClass = 'border-r-2 border-b-2 border-t-2'
    if (index === droppedDominoes2[i][0] && index + rowLength === droppedDominoes2[i][0]) borderClass = 'border-r-2 border-l-2 border-t-2'
    if (index === droppedDominoes2[i][1] && index - rowLength === droppedDominoes2[i][0]) borderClass = 'border-r-2 border-b-2 border-l-2'
  }
  const firstColumnCheck = leftSqIndex % rowLength !== 0 || isTurned
  const indextoCheck = direction === 'right' ? index - 1 : direction === 'down' ? index - rowLength : index - 1
  let isLeftSquareActive =
    isDominoPlacedCorrectly(
      direction === 'right' ? index + 1 : direction === 'down' ? index + rowLength : direction === 'left' ? index - 1 : index - rowLength,
    ) &&
    isOver &&
    canDrop // Check if it's the left square
  isLeftSquareActive && console.log(index + '| left index:' + leftSqIndex)
  let backgroundColor = 'snow'
  let borderColor = 'border-gray-200'
  let animation = ''
  if (isActive || isLeftSquareActive) {
    borderColor = 'border-green-400'
    backgroundColor = 'darkgreen'
    animation = 'transition ease-in-out duration-200'
  } else if (canDrop) {
    backgroundColor = 'lightgray'
    borderColor = 'border-gray-200'
  }
  return (
    <div
      className={` h-24 w-24 ${borderClass} ${borderColor} ${animation} bg-yellow-500 ring-gray-200 relative shadow-lg z-20`}
      style={{ backgroundColor }}
      ref={drop}
      data-testid="Square">
      {}
      {hasStar && <Image src="/starbr.png" alt="star" width={500} height={500} className="absolute top-0 left-0 w-2/3 h-2/3 z-50" />}
      {lastDroppedItem && (
        <div className={`h-[92px] w-[92px]  shadow-lg z-20 `}>
          <Image src={lastDroppedItem.img} alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
      {accept.length === 0 && (
        <div className={`h-[92px] w-[92px]  shadow-lg z-20 `}>
          <Image src="/wasteland-01.svg" alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
    </div>
  )
})
