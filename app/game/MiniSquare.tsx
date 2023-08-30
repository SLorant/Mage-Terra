import { FC } from 'react'
import { memo } from 'react'
import Image from 'next/image'
import { rowLength } from './MapConfig'
import { LittleStar } from '@/utils/Vectors'
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
      case 'Dungeon': {
        squareColor = 'bg-purple'
        break
      }
      case 'Lagoon': {
        squareColor = 'bg-pink'
        break
      }
      case 'Mt': {
        squareColor = 'bg-green'
        break
      }
      case 'Village': {
        squareColor = 'bg-blue'
        break
      }

      case 'Field': {
        squareColor = 'bg-orange'
        break
      }
      case 'DungeonLagoonMtVillageFieldRuin': {
        squareColor = 'bg-white'
        break
      }
    }
  }
  return (
    <div className={` h-6 w-6 border-none  bg-lightpurple ring-none relative z-20`} data-testid="Square">
      {hasStar && <LittleStar />}
      {lastDroppedItem && <div className={`h-[24px] w-[24px]  shadow-lg z-20 ${squareColor}`}></div>}
      {accept.includes('W') && <div className={`h-[24px] w-[24px]  shadow-lg z-20 bg-darkgrey`}></div>}
    </div>
  )
})
