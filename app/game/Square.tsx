import { FC, useEffect } from 'react'
import { memo, Dispatch, SetStateAction } from 'react'
import { useDrop } from 'react-dnd'
import Image from 'next/image'
import { rowLength } from './MapConfig'
import { SquareProps } from './Interfaces'

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
  isLeftSquareActive,
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
    onIsOverChange(direction === 'left' || direction === 'top' ? index : direction === 'down' ? index - rowLength : index - 1, isOver)
  }, [isOver])

  let borderClass = 'border-[1px]'
  for (let i = 0; i < droppedDominoes2.length; i++) {
    if (index === droppedDominoes2[i][0] && index + 1 === droppedDominoes2[i][1]) borderClass = 'border-l-[1px] border-b-[1px] border-t-[1px]'
    if (index === droppedDominoes2[i][1] && index - 1 === droppedDominoes2[i][0]) borderClass = 'border-r-[1px] border-b-[1px] border-t-[1px]'
    if (index === droppedDominoes2[i][0] && index + rowLength === droppedDominoes2[i][0]) borderClass = 'border-r-[1px] border-l-[1px] border-t-[1px]'
    if (index === droppedDominoes2[i][1] && index - rowLength === droppedDominoes2[i][0]) borderClass = 'border-r-[1px] border-b-[1px] border-l-[1px]'
  }

  const firstColumnCheck = leftSqIndex % rowLength !== 0 || isTurned
  let bgColor = 'bg-grey'
  let borderColor = 'border-lightpurple'
  let animation = ''
  if (isActive || (isLeftSquareActive && canDrop && firstColumnCheck)) {
    borderColor = 'border-grey'
    bgColor = 'bg-green'
    animation = 'transition ease-in-out  duration-200'
  } else if (canDrop) {
    bgColor = 'bg-grey'
    borderColor = 'border-lightpurple'
  }
  return (
    <div className={` h-20 w-20 ${borderClass} ${borderColor} ${animation} ${bgColor} relative shadow-lg z-20`} ref={drop} data-testid="Square">
      {hasStar && <Image src="/starbr.png" alt="star" width={500} height={500} className="absolute top-0 left-0 w-2/3 h-2/3 z-50" />}
      {lastDroppedItem && (
        <div className={`h-[78px] w-[78px]  shadow-lg z-20 bg-purple`}>
          {/*  <Image src={lastDroppedItem.img} alt="dropped" width={50} height={50} className="w-full h-full " /> */}
        </div>
      )}
      {accept.includes('W') && (
        <div className={`h-[70px] w-[70px]  shadow-lg z-20 `}>
          <Image src="/wasteland-01.svg" alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
    </div>
  )
})
