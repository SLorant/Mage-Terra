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
  droppedDominoes,
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
  for (let i = 0; i < droppedDominoes.length; i++) {
    if (index === droppedDominoes[i][0] && index + 1 === droppedDominoes[i][1]) borderClass = 'border-l-[1px] border-b-[1px] border-t-[1px]'
    if (index === droppedDominoes[i][1] && index - 1 === droppedDominoes[i][0]) borderClass = 'border-r-[1px] border-b-[1px] border-t-[1px]'
    if (index === droppedDominoes[i][0] && index + rowLength === droppedDominoes[i][0]) borderClass = 'border-r-[1px] border-l-[1px] border-t-[1px]'
    if (index === droppedDominoes[i][1] && index - rowLength === droppedDominoes[i][0]) borderClass = 'border-r-[1px] border-b-[1px] border-l-[1px]'
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
        <div className={`h-auto w-auto  shadow-lg z-20 `}>
          <Image src={lastDroppedItem.img} alt="dropped" width={50} height={50} className="w-full h-full " unoptimized />
        </div>
      )}
      {accept.includes('W') && (
        <div className={`h-auto w-auto  shadow-lg z-20 `}>
          <Image src="/wasteland-01.webp" alt="dropped" width={50} height={50} className="w-full h-full " />
        </div>
      )}
    </div>
  )
})
