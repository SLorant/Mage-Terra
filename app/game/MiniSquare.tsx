import { FC } from 'react'
import { memo } from 'react'
import Image from 'next/image'

type DroppedDominoes = [number, number]
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  hasStar: boolean
  index: number
  droppedDominoes: DroppedDominoes[]
}

export const MiniSquare: FC<SquareProps> = memo(function Square({ accept, lastDroppedItem, hasStar, index, droppedDominoes }) {
  let borderClass = 'border-2'
  for (let i = 0; i < droppedDominoes.length; i++) {
    if (index === droppedDominoes[i][0] && index + 1 === droppedDominoes[i][1]) borderClass = 'border-l-2 border-b-2 border-t-2'
    if (index === droppedDominoes[i][1] && index - 1 === droppedDominoes[i][0]) borderClass = 'border-r-2 border-b-2 border-t-2'
    if (index === droppedDominoes[i][0] && index + 8 === droppedDominoes[i][0]) borderClass = 'border-r-2 border-l-2 border-t-2'
    if (index === droppedDominoes[i][1] && index - 8 === droppedDominoes[i][0]) borderClass = 'border-r-2 border-b-2 border-l-2'
  }

  return (
    <div className={` h-10 w-10 border-gray-200 ${borderClass} bg-gray-100 ring-gray-200 relative shadow-lg z-20`} data-testid="Square">
      {hasStar && <Image src="/starbr.png" alt="star" width={500} height={500} className="absolute top-0 left-0 w-2/3 h-2/3 z-50" />}
      {lastDroppedItem && (
        <div className={`h-[39px] w-[39px]  shadow-lg z-20 `}>
          <Image src={lastDroppedItem.img} alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
      {accept === undefined && (
        <div className={`h-[39px] w-[39px]  shadow-lg z-20 `}>
          <Image src="/pain.jpeg" alt="dropped" width={500} height={500} className="w-full h-full " />
        </div>
      )}
    </div>
  )
})
