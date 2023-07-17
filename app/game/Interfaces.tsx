import { Dispatch, SetStateAction } from 'react'

export interface BoardProps {
  uniqueId: string
  room: string | null
  isDropped: boolean
  setIsDropped: Dispatch<SetStateAction<boolean>>
}
interface PlayerInfo {
  name: string
  score: number
}
export interface ScoreBoardProps {
  uniqueId: string
  playerInfos: { [key: string]: PlayerInfo }
  readBoards: { [playerId: string]: SquareState[] }
}

export interface SquareState {
  accepts: string[]
  lastDroppedItem: any
  hasStar: boolean
}

export interface DominoState {
  firstname: string
  secondname: string
  img: string
  secondimg: string
}

export interface SquareSpec {
  accepts: string[]
  lastDroppedItem: any
}
export interface DominoSpec {
  name: string
  type: string
}
export interface BoardState {
  droppedDominoNames: string[]
  Squares: SquareSpec[]
  Domino: DominoSpec[]
}
type DroppedDomino2 = [number, number]
export interface SquareProps {
  accept: string[]
  lastDroppedItem?: any
  hasStar: boolean
  onDrop: (item: any) => void
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  index: number
  onIsOverChange: (index: number, isOver: boolean) => void
  leftSqIndex: number
  droppedDominoes2: DroppedDomino2[]
  isTurned: boolean
  direction: string
  isLeftSquareActive: boolean
}
