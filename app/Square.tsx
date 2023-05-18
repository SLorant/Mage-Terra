import { CSSProperties, FC, useEffect } from 'react'
import { memo, useState, Dispatch, SetStateAction } from 'react'
import { useDrop } from 'react-dnd'

export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  onDrop: (item: any) => void
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  index: number
  onIsOverChange: (index: number, isOver: boolean) => void // Update the prop
}

export const Square: FC<SquareProps> = memo(function Square({
  accept,
  lastDroppedItem,
  onDrop,
  isActive,
  setIsActive,
  index,
  onIsOverChange,
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

  let backgroundColor = 'snow'
  if (isActive) {
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'lightgray'
  }
  return (
    <div
      className="h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20"
      style={{ backgroundColor }}
      ref={drop}
      data-testid="Square">
      {lastDroppedItem && (
        <div className="h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20">
          <p>{JSON.stringify(lastDroppedItem.name.substring(0, 1))}</p>
        </div>
      )}
    </div>
  )
})
//{lastDroppedItem && <p>{JSON.stringify(lastDroppedItem)}</p>}
/* This Square accepts: ${accept.join(', ')} */
