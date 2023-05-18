import { CSSProperties, FC, useEffect, useState } from 'react'
import { memo, useRef, useMemo } from 'react'
import { useDrag, useDragLayer, XYCoord } from 'react-dnd'

const style: CSSProperties = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  padding: '0.5rem 1rem',
  marginRight: '1.5rem',
  marginBottom: '1.5rem',
  cursor: 'move',
  float: 'left',
}

export interface DominoProps {
  name: string
  type: string
  isDropped: boolean
}

export const Domino: FC<DominoProps> = memo(function Domino({ name, type, isDropped }) {
  const dominoRef = useRef<HTMLDivElement>(null)

  const [{ opacity, isDragging, didDrop }, drag] = useDrag(
    () => ({
      type,
      item: { name },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
        isDragging: monitor.isDragging() ? true : false,
        didDrop: monitor.didDrop() ? true : false,
      }),
    }),
    [name, type],
  )

  return (
    <div ref={drag} className="flex w-[160px]">
      <div ref={dominoRef} style={{ ...style, opacity }} className="flex w-[160px]">
        <div className={`h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          {name}
        </div>
        <div className={`h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          {name}
        </div>
      </div>
    </div>
  )
})
// {isDropped ? <s>{name}</s> : name}
