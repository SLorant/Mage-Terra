import { Dispatch, SetStateAction, MutableRefObject } from 'react'

export interface BoardProps {
  uniqueId: string
  room: string | null
  isDropped: boolean
  setIsDropped: Dispatch<SetStateAction<boolean>>
  Domino: DominoState
  setDomino: Dispatch<SetStateAction<DominoState>>
  victory: MutableRefObject<boolean>
}
export interface PlayerInfo {
  name: string
  score: number
  avatar: string
}
export interface playerInfo2 {
  [key: string]: [name: string, score: number, avatar: string]
}
export interface ScoreBoardProps {
  uniqueId: string
  playerInfos: { [key: string]: PlayerInfo }
  needBoard: boolean
  readBoards?: { [playerId: string]: [SquareState[], string, string] }
  sbOpened: boolean
  setSbOpened: Dispatch<SetStateAction<boolean>>
  scoreText: string
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
type DroppedDomino = [number, number]
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
  droppedDominoes: DroppedDomino[]
  isTurned: boolean
  direction: string
  isLeftSquareActive: boolean
}
export interface VictoryScreenProps {
  playerInfos: { [key: string]: PlayerInfo }
  uniqueId: string
}
export interface TradingProps {
  room: string | null
  uniqueId: string
  Domino: DominoState
  round: number
  hostId: string
  setIsRoundOver: Dispatch<SetStateAction<boolean>>
}
export interface MapSetterProps {
  Squares: SquareState[]
  uniqueId: string
  room: string
  victory: MutableRefObject<boolean>
}
export interface PlayerGridProps {
  readNames: {
    [key: string]: {
      Name: string
      Avatar: number
    }
  }
  playerName: string
  uniqueId: string
  hostId: string
}
export interface AvatarChooserProps {
  room: string
  uniqueId: string
  playerName: string
  setIsSpectator: Dispatch<SetStateAction<boolean>>
  isSpectator: boolean
  error: string
  setError: Dispatch<SetStateAction<string>>
  setPlayerName: Dispatch<SetStateAction<string>>
  currentPlayers: number
  readNames: {
    [key: string]: {
      Name: string
      Avatar: number
    }
  }
  wentBack: boolean
}
export interface DominoPickerProps {
  uniqueId: string
  hostId: string
  countDown: number
  originalDomino: DominoState
  setDomino: Dispatch<SetStateAction<DominoState>>
  room: string
  readBoards: { [playerId: string]: [SquareState[], string, string] }
  setDonePicking: Dispatch<SetStateAction<boolean>>
  arcaneType: string
  playerArcanes: { [key: string]: PlayerInfo }
  setPlayerArcanes: Dispatch<SetStateAction<{ [key: string]: PlayerInfo }>>
}
export interface RoundBarProps {
  round: number
  setArcaneType: Dispatch<SetStateAction<string>>
  room: string
  uniqueId: string
  hostId: string
}
export interface DominoPreviewProps {
  isTurned: boolean
}
