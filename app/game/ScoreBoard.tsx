import { useEffect, useState, memo, FC } from 'react'
import { ScoreBoardProps } from './Interfaces'
import { MiniSquare } from './MiniSquare'
import { ItemTypes } from '../ItemTypes'
import { SquareState } from './Interfaces'
import { mapLength } from './MapConfig'
import Image from 'next/image'

export const ScoreBoard: FC<ScoreBoardProps> = memo(function ScoreBoard({ uniqueId, playerInfos, readBoards }) {
  const [rankedPlayers, setRankedPlayers] = useState<{ playerId: string; rank: number; name: string; avatar: string }[]>([])

  useEffect(() => {
    // Calculate the rank for each player
    const rankedPlayersData = Object.entries(playerInfos).map(([playerId, { score, name, avatar }]) => ({
      playerId,
      score,
      name,
      avatar,
    }))
    rankedPlayersData.sort((a, b) => b.score - a.score)

    setRankedPlayers(
      rankedPlayersData.map((player, index) => ({
        playerId: player.playerId,
        name: player.name,
        avatar: player.avatar,
        rank: index + 1,
      })),
    )
  }, [playerInfos])

  const getRankByPlayerId = (playerId: string): number => {
    const playerData = rankedPlayers.find((player) => player.playerId === playerId)
    if (playerData) return playerData.rank
    else return 2
  }
  const [currentBoard, setCurrentBoard] = useState(0)
  const handleNextBoard = () => {
    if (Object.keys(readBoards).length - 1 === currentBoard) setCurrentBoard(0)
    else setCurrentBoard(currentBoard + 1)
  }
  const handlePrevBoard = () => {
    if (currentBoard === 0) setCurrentBoard(Object.keys(readBoards).length - 1)
    else setCurrentBoard(currentBoard - 1)
  }
  const initialSquares: SquareState[] = Array.from({ length: mapLength }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))
  const [Squares, setSquares] = useState<SquareState[]>(initialSquares)
  /*  const newSquares = useMapSetter(Squares, uniqueId, room ?? '')
  useEffect(() => {
    setSquares(newSquares)
  }, []) */
  const firstPlayerSquares = Object.values(readBoards)[currentBoard] ? Object.values(readBoards)[currentBoard][0] : Squares
  const boardName: string = Object.values(readBoards)[currentBoard] ? Object.values(readBoards)[currentBoard][1] : ''

  const emptyRows = new Array(6 - Object.keys(playerInfos).length).fill(null)

  return (
    <aside id="fade-in" className="mt-12 w-[335px] bg-grey flex flex-col h-[500px] justify-start items-center gap-2 relative">
      <div className="flex flex-col text-xl text-white w-full items-center text-center">
        {Object.entries(playerInfos).map(([playerId, { name, score, avatar }]) => (
          <div
            key={playerId}
            className={`${
              getRankByPlayerId(playerId) % 2 === 0 ? 'bg-grey' : 'bg-lightpurple'
            } text-darkblue w-full h-10 justify-start items-center flex relative`}>
            <div className="ml-4">{getRankByPlayerId(playerId)}</div>
            <div className="ml-4">
              <Image height={30} width={30} src={`/avatars/avatars-${avatar}.png`} alt="playeravatar" unoptimized></Image>
            </div>
            <div className="ml-4 text-lg">{playerId === uniqueId ? name + ' (you)' : name}</div>
            <div className="mr-4 absolute right-2">{score} p</div>
          </div>
        ))}
        {Object.entries(emptyRows).map((_, index) => (
          <div
            key={index}
            className={`${emptyRows.length % 2 === 0 ? (index % 2 === 0 ? 'bg-lightpurple' : 'bg-grey') : (index + 1) % 2 === 0 ? 'bg-lightpurple' : 'bg-grey'}
             text-darkblue w-full h-12 justify-start items-center flex `}></div>
        ))}
      </div>
      <div className="absolute bottom-8 gap-4 flex  h-[165px] w-[240px] ">
        <button className="z-20 text-3xl text-white mb-2" onClick={handlePrevBoard}>
          &#10094;
        </button>
        <div className="flex flex-col items-center justify-center">
          <div className="h-[165px] w-[165px] grid grid-cols-7 grid-rows-7">
            {firstPlayerSquares.map(({ accepts, lastDroppedItem, hasStar }, squareIndex) => (
              <MiniSquare accept={accepts} lastDroppedItem={lastDroppedItem} hasStar={hasStar} index={squareIndex} key={`${squareIndex}`} />
            ))}
          </div>
          <p className="text-darkblue mt-2">{boardName}'s map</p>
        </div>
        <button className="z-20 text-3xl text-white mb-2" onClick={handleNextBoard}>
          &#10095;
        </button>
      </div>
    </aside>
  )
})

export default ScoreBoard
