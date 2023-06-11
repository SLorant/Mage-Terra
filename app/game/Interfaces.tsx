import { Dispatch, SetStateAction } from 'react'

export interface BoardProps {
  uniqueId: string
  room: string | null
  setIsChanged: Dispatch<SetStateAction<boolean>>
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
