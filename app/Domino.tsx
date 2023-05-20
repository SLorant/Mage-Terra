import { CSSProperties, Dispatch, FC, SetStateAction, useEffect, useState } from 'react'
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
  firstname: string
  secondname: string
  firsttype: string
  secondtype: string
  isDropped: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
}

export const Domino: FC<DominoProps> = memo(function Domino({
  firstname,
  firsttype,
  secondname,
  secondtype,
  isDropped,
  setIsActive,
}) {
  const dominoRef = useRef<HTMLDivElement>(null)

  const [{ opacity, isDragging, didDrop }, drag] = useDrag(
    () => ({
      type: firsttype,
      item: { firstname, secondname, firsttype, secondtype },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.9 : 1,
        isDragging: monitor.isDragging() ? true : false,
        didDrop: monitor.didDrop() ? true : false,
      }),
    }),
    [firstname, firsttype, secondname, secondtype],
  )
  useEffect(() => {
    !isDragging ? setIsActive(false) : ''
  }, [isDragging])

  return (
    <div ref={drag} className="flex w-[160px]">
      <div ref={dominoRef} style={{ ...style, opacity }} className="flex w-[160px]">
        <div className={`h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          {firstname}
        </div>
        <div className={`h-16 w-16 ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          {secondname}
        </div>
      </div>
    </div>
  )
})
// {isDropped ? <s>{name}</s> : name}
