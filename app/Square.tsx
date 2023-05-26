import { CSSProperties, FC, useEffect } from 'react'
import { memo, useState, Dispatch, SetStateAction } from 'react'
import { useDrop } from 'react-dnd'
import Image from 'next/image'

export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  onDrop: (item: any) => void
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  index: number
  onIsOverChange: (index: number, isOver: boolean) => void // Update the prop
  leftSqIndex: number
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

  let isLeftSquareActive = leftSqIndex === index && leftSqIndex % 10 !== 0 && canDrop // Check if it's the left square
  let backgroundColor = 'snow'
  if (isActive || isLeftSquareActive) {
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'lightgray'
  }
  //console.log(lastDroppedItem)
  return (
    <div
      className="h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20"
      style={{ backgroundColor }}
      ref={drop}
      data-testid="Square">
      {lastDroppedItem && (
        <div className="h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20">
          <Image src={lastDroppedItem.img} alt="kep" width={500} height={500} className="w-full h-full pbject-cover" />
        </div>
      )}
    </div>
  )
})
// <p>{JSON.stringify(lastDroppedItem.firstname.substring(0, 1))}</p>

//{lastDroppedItem && <p>{JSON.stringify(lastDroppedItem)}</p>}
/* This Square accepts: ${accept.join(', ')} */
