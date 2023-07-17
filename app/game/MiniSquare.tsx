import { FC } from 'react'
import { memo } from 'react'
import Image from 'next/image'
import { rowLength } from './MapConfig'
type DroppedDominoes = [number, number]
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  hasStar: boolean
  index: number
  //droppedDominoes: DroppedDominoes[]
}

export const MiniSquare: FC<SquareProps> = memo(function Square({ accept, lastDroppedItem, hasStar, index /* droppedDominoes */ }) {
  let borderClass = 'border-2'
  /* for (let i = 0; i < droppedDominoes.length; i++) {
    if (index === droppedDominoes[i][0] && index + 1 === droppedDominoes[i][1]) borderClass = 'border-l-2 border-b-2 border-t-2'
    if (index === droppedDominoes[i][1] && index - 1 === droppedDominoes[i][0]) borderClass = 'border-r-2 border-b-2 border-t-2'
    if (index === droppedDominoes[i][0] && index + rowLength === droppedDominoes[i][0]) borderClass = 'border-r-2 border-l-2 border-t-2'
    if (index === droppedDominoes[i][1] && index - rowLength === droppedDominoes[i][0]) borderClass = 'border-r-2 border-b-2 border-l-2'
  } */
  let squareColor = 'bg-transparent'

  if (lastDroppedItem) {
    switch (lastDroppedItem.firstname) {
      case 'Cave': {
        squareColor = 'bg-purple'
        break
      }
      case 'Swamp': {
        squareColor = 'bg-pink'
        break
      }
      case 'Mt': {
        squareColor = 'bg-green'
        break
      }
      case 'City': {
        squareColor = 'bg-blue'
        break
      }

      case 'Field': {
        squareColor = 'bg-orange'
        break
      }
      case 'CaveSwampMtCityFieldRuin': {
        squareColor = 'bg-white'
        break
      }
    }
  }
  return (
    <div className={` h-6 w-6 border-gray-200  bg-darkblue ring-gray-200 relative shadow-lg z-20`} data-testid="Square">
      {hasStar && <Image draggable="false" src="/starbr.png" alt="star" width={500} height={500} className="absolute top-0 left-0 w-2/3 h-2/3 z-50" />}
      {lastDroppedItem && <div className={`h-[24px] w-[24px]  shadow-lg z-20 ${squareColor}`}></div>}
      {accept.includes('W') && <div className={`h-[24px] w-[24px]  shadow-lg z-20 bg-black`}></div>}
    </div>
  )
})
