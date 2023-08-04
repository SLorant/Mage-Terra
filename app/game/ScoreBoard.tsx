import { useEffect, useState, memo, FC } from 'react'
import { ScoreBoardProps } from './Interfaces'
import { MiniSquare } from './MiniSquare'
import { MapSetter } from './MapSetter'
import { ItemTypes } from '../ItemTypes'
import { SquareState } from './Interfaces'
import { rowLength, mapLength } from './MapConfig'
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
  useEffect(() => {
    const newSquares = MapSetter(Squares)
    setSquares(newSquares)
  }, [])
  const firstPlayerSquares = Object.values(readBoards)[currentBoard] ? Object.values(readBoards)[currentBoard][0] : Squares
  const boardName: string = Object.values(readBoards)[currentBoard] ? Object.values(readBoards)[currentBoard][1] : ''
  return (
    <aside className="mt-20 w-[300px] bg-lightpurple flex flex-col h-[450px] justify-start items-center gap-2 relative">
      <div className="flex flex-col text-xl text-white w-full items-center text-center">
        {Object.entries(playerInfos).map(([playerId, { name, score, avatar }]) => (
          <div
            key={playerId}
            className={`${
              getRankByPlayerId(playerId) % 2 === 0 ? 'bg-grey' : 'bg-lightpurplepurple'
            } text-darkblue w-full h-10 justify-start items-center flex relative`}>
            <div className="ml-4">{getRankByPlayerId(playerId)}</div>
            <div className="ml-4">
              <Image height={30} width={30} src={`/avatar-${avatar}.png`} alt="playeravatar" unoptimized></Image>
            </div>
            <div className="ml-4">{playerId === uniqueId ? name + ' (you)' : name}</div>
            <div className="mr-4 absolute right-2">{score} p</div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-10 gap-4 flex  h-[165px] w-[240px] ">
        <button className="z-50 text-3xl text-white mb-2" onClick={handlePrevBoard}>
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
        <button className="z-50 text-3xl text-white mb-2" onClick={handleNextBoard}>
          &#10095;
        </button>
      </div>
    </aside>
  )
})

export default ScoreBoard
