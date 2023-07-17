import { useEffect, useState, memo, FC } from 'react'
import { ScoreBoardProps } from './Interfaces'
import { MiniSquare } from './MiniSquare'
export const ScoreBoard: FC<ScoreBoardProps> = memo(function Board({ uniqueId, playerInfos, readBoards }) {
  const [rankedPlayers, setRankedPlayers] = useState<{ playerId: string; rank: number }[]>([])
  useEffect(() => {
    // Calculate the rank for each player
    const rankedPlayersData = Object.entries(playerInfos).map(([playerId, { score }]) => ({
      playerId,
      score,
    }))

    rankedPlayersData.sort((a, b) => b.score - a.score)

    setRankedPlayers(
      rankedPlayersData.map((player, index) => ({
        playerId: player.playerId,
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
  const firstPlayerSquares = Object.values(readBoards)[currentBoard] || []

  return (
    <aside className="mt-20 w-[300px] bg-lightpurple flex flex-col h-[450px] justify-start items-center gap-2 ">
      <div className="flex flex-col text-xl text-white w-full items-center text-center">
        {Object.entries(playerInfos).map(([playerId, { name, score }]) => (
          <div
            key={playerId}
            className={`${
              getRankByPlayerId(playerId) % 2 === 0 ? 'bg-grey' : 'bg-lightpurplepurple'
            } text-darkblue w-full h-10 justify-between items-center flex `}>
            <div className="ml-4">{getRankByPlayerId(playerId)}</div>
            <div>{playerId === uniqueId ? name + ' (you)' : name}</div>
            <div className="mr-4">{score}</div>
          </div>
        ))}
      </div>
      <div className="mt-32 gap-4 flex  h-[165px] w-[240px] ">
        <button className="z-50 text-3xl text-white" onClick={handlePrevBoard}>
          &#10094;
        </button>

        <div className="h-[165px] w-[165px] grid grid-cols-7 grid-rows-7">
          {firstPlayerSquares.map(({ accepts, lastDroppedItem, hasStar }, squareIndex) => (
            <MiniSquare accept={accepts} lastDroppedItem={lastDroppedItem} hasStar={hasStar} index={squareIndex} key={`${squareIndex}`} />
          ))}
        </div>

        <button className="z-50 text-3xl text-white" onClick={handleNextBoard}>
          &#10095;
        </button>
      </div>
    </aside>
  )
})

export default ScoreBoard
