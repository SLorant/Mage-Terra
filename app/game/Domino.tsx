import { CSSProperties, Dispatch, FC, SetStateAction, useEffect, memo, useRef, useState } from 'react'
import { useDrag, useDragLayer } from 'react-dnd'
import { ItemTypes } from '../ItemTypes'
import Image from 'next/image'
const style: CSSProperties = {
  border: '1px dashed gray',
  backgroundColor: 'white',
  cursor: 'move',
}

export interface DominoProps {
  firstname: string
  secondname: string
  isDropped: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  img: string
  secondimg: string
  isTurned: boolean
  setDirection: Dispatch<SetStateAction<string>>
}

export const DominoComponent: FC<DominoProps> = memo(function Domino({
  firstname,
  secondname,
  isDropped,
  setIsActive,
  img,
  secondimg,
  isTurned,
  setDirection,
}) {
  const dominoRef = useRef<HTMLDivElement>(null)
  const [{ opacity, isDragging, canDrag }, drag] = useDrag(
    () => ({
      type: ItemTypes.DOMINO,
      item: { firstname, secondname, img, secondimg },
      canDrag: !isDropped,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.9 : 1,
        isDragging: monitor.isDragging() ? true : false,
        canDrag: monitor.canDrag() ? true : false,
      }),
    }),
    [firstname, secondname, img, secondimg, isDropped],
  )
  useEffect(() => {
    !isDragging && setIsActive(false)
  }, [isDragging])

  const { currentOffset } = useDragLayer((monitor) => ({
    currentOffset: monitor.getInitialClientOffset(),
  }))

  const getCursorPosition = (x: number) => {
    if (dominoRef.current) {
      const dominoRect = dominoRef.current.getBoundingClientRect()
      const dominoCenter = dominoRect.left + dominoRect.width / 2
      const position = x > dominoCenter ? 'right' : 'left'
      return position
    }
    return ''
  }
  useEffect(() => {
    const temp = currentOffset && getCursorPosition(currentOffset.x)
    temp && setDirection(temp)
  }, [currentOffset])

  return (
    <div className={`${isTurned ? 'h-[200px]' : 'w-[200px]'} ${isDropped && 'opacity-50'} flex  ml-10 justify-center items-center`}>
      <div ref={drag}>
        <div ref={dominoRef} style={{ ...style, opacity }} className={`${isTurned ? 'flex-col w-[80px] h-[160px]' : 'w-[160px] h-[80px]'} flex  mt-6`}>
          <div className={`w-[80px] h-[80px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
            <Image src={img} alt="kep" width={80} height={80} className="w-full h-full pbject-cover" draggable="false" />
          </div>
          <div className={`w-[80px] h-[80px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
            <Image src={secondimg} alt="kep" width={80} height={80} className="w-full h-full pbject-cover" draggable="false" />
          </div>
        </div>
      </div>
    </div>
  )
})
