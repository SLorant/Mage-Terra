import { useEffect, useState } from 'react'
import { VictoryScreenProps } from './Interfaces'
import Image from 'next/image'

const VictoryScreen = ({ playerInfos, uniqueId }: VictoryScreenProps) => {
  playerInfos && console.log(playerInfos)
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
  return (
    <div className="absolute left-40 top-40 h-[500px] w-[500px] bg-pink z-50">
      <div className="flex flex-col text-xl text-white w-full items-center text-center">
        {Object.entries(playerInfos).map(([playerId, { name, score, avatar }]) => (
          <div
            key={playerId}
            className={`${
              getRankByPlayerId(playerId) % 2 === 0 ? 'bg-grey' : 'bg-lightpurplepurple'
            } text-darkblue w-1/2 h-10 justify-between items-center flex `}>
            {getRankByPlayerId(playerId) === 1 && <div>The winner is: {name}</div>}
            <div>
              <Image height={60} width={60} src={`/avatar-${avatar}.png`} alt="playeravatar"></Image>
            </div>
            <div className="ml-4">{getRankByPlayerId(playerId)}</div>
            <div>{playerId === uniqueId ? name + ' (you)' : name}</div>
            <div className="mr-4">{score}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VictoryScreen
