import { FC } from 'react'
import { memo } from 'react'
import { LittleStar } from '@/app/_components/Vectors'
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  hasStar: boolean
  index: number
  //droppedDominoes: DroppedDominoes[]
}

export const MiniSquare: FC<SquareProps> = memo(function Square({ accept, lastDroppedItem, hasStar, index /* droppedDominoes */ }) {
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
    <div className={` h-7 w-7 md:h-6 md:w-6 border-none  bg-lightpurple ring-none relative z-20`} data-testid="Square">
      {hasStar && (
        <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full">
          <LittleStar />
        </div>
      )}
      {lastDroppedItem && <div className={`h-[28px] w-[28px] md:h-[24px] md:w-[24px]  shadow-lg z-20 ${squareColor}`}></div>}
      {accept.includes('W') && <div className={`h-[28px] w-[28px] md:h-[24px] md:w-[24px]   shadow-lg z-20 bg-darkgrey`}></div>}
    </div>
  )
})
