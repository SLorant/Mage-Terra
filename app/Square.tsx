import { FC, useEffect } from 'react'
import { memo, Dispatch, SetStateAction } from 'react'
import { useDrop } from 'react-dnd'
import Image from 'next/image'

type DroppedDomino2 = [number, number]
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  onDrop: (item: any) => void
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  index: number
  onIsOverChange: (index: number, isOver: boolean) => void // Update the prop
  leftSqIndex: number
  droppedDominoes2: DroppedDomino2[]
}

export const Square: FC<SquareProps> = memo(function Square({
  accept,
  lastDroppedItem,
  onDrop,
  isActive,
  setIsActive,
  index,
  onIsOverChange,
  leftSqIndex,
  droppedDominoes2,
}) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  //isActive = isOver && canDrop
  useEffect(() => {
    if (isOver && canDrop) {
      setIsActive(true)
    }
  }, [isOver])

  useEffect(() => {
    onIsOverChange(index, isOver) // Notify the Board component of isOver change
  }, [isOver])

  let isWholeDomino = false
  let borderClass = 'border-2'
  for (let i = 0; i < droppedDominoes2.length; i++) {
    if (index === droppedDominoes2[i][0] && index + 1 === droppedDominoes2[i][1])
      borderClass = 'border-l-2 border-b-2 border-t-2'
    if (index === droppedDominoes2[i][1] && index - 1 === droppedDominoes2[i][0])
      borderClass = 'border-r-2 border-b-2 border-t-2'
    if (index === droppedDominoes2[i][0] && index + 8 === droppedDominoes2[i][0])
      borderClass = 'border-r-2 border-l-2 border-t-2'
    if (index === droppedDominoes2[i][1] && index - 8 === droppedDominoes2[i][0])
      borderClass = 'border-r-2 border-b-2 border-l-2'
  }

  let isLeftSquareActive = leftSqIndex === index && leftSqIndex % 8 !== 0 && canDrop // Check if it's the left square
  let backgroundColor = 'snow'
  if (isActive || isLeftSquareActive) {
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'lightgray'
  }
  //console.log(lastDroppedItem)
  return (
    <div
      className={`${
        isWholeDomino ? '' : ''
      } h-20 w-20 border-gray-200 ${borderClass} bg-yellow-500 ring-gray-200 shadow-lg z-20`}
      style={{ backgroundColor }}
      ref={drop}
      data-testid="Square">
      {lastDroppedItem && (
        <div className={`h-20 w-20  shadow-lg z-20 `}>
          <Image src={lastDroppedItem.img} alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
    </div>
  )
})
// <p>{JSON.stringify(lastDroppedItem.firstname.substring(0, 1))}</p>

//{lastDroppedItem && <p>{JSON.stringify(lastDroppedItem)}</p>}
/* This Square accepts: ${accept.join(', ')} */
