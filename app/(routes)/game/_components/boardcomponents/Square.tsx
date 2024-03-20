import { FC, useEffect } from 'react'
import { memo, useState } from 'react'
import { useDrop } from 'react-dnd'
import Image from 'next/image'
import { rowLength } from './MapConfig'
import { SquareProps } from '../../../../_components/Interfaces'

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
    bgColor = 'bg-lightpurple'
    animation = 'transition ease-in-out  duration-200'
  } else if (canDrop) {
    bgColor = 'bg-grey'
    borderColor = 'border-lightpurple'
  }
  const ruins = ['/dominoes/ruin-01.webp', '/dominoes/ruin-02.webp', '/dominoes/ruin-03.webp']
  const [randomRuin, setRandomRuin] = useState(1)
  useEffect(() => {
    setRandomRuin(Math.floor(Math.random() * ruins.length) + 1)
  }, [])

  return (
    <div
      className={`h-[14.5vw]  md:h-20 md:w-20
     ${borderClass} ${borderColor} ${animation} ${bgColor} relative shadow-lg z-20`}
      ref={drop}
      data-testid="Square">
      {hasStar && (
        <Image
          src="/dominoes/star.svg"
          alt="star"
          width={50}
          height={50}
          className="absolute top-2 left-2 md:top-2.5 md:left-2.5 w-3/4 h-3/4 z-50"
          unoptimized
        />
      )}
      {lastDroppedItem && (
        <div className={`h-auto w-auto  shadow-lg z-20 `}>
          <Image src={lastDroppedItem.img} alt="dropped" width={50} height={50} className="w-full h-full " unoptimized />
        </div>
      )}
      {accept.includes('W') && (
        <div className={`h-auto w-auto  shadow-lg z-20 `}>
          <Image src={`/dominoes/ruin-0${randomRuin}.webp`} alt="dropped" width={50} height={50} className="w-full h-full" unoptimized />
        </div>
      )}
    </div>
  )
})
