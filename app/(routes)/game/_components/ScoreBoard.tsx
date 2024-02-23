import { useEffect, useState, memo, FC } from 'react'
import { MiniSquare } from './MiniSquare'
import { ItemTypes } from '../../../_types/ItemTypes'
import { SquareState, ScoreBoardProps } from '../../../_components/Interfaces'
import { mapLength } from './boardcomponents/MapConfig'
import Image from 'next/image'

export const ScoreBoard: FC<ScoreBoardProps> = memo(function ScoreBoard({ uniqueId, playerInfos, needBoard, readBoards, sbOpened, setSbOpened, scoreText }) {
  const [rankedPlayers, setRankedPlayers] = useState<{ playerId: string; rank: number; name: string; avatar: string }[]>([])
  const [currentBoard, setCurrentBoard] = useState(0)

  useEffect(() => {
    // Calculate the rank for each player
    const rankedPlayersData = Object.entries(playerInfos).map(([playerId, { score, name, avatar }]) => ({
      playerId,
      score,
      name,
      avatar,
    }))
    rankedPlayersData.sort((a, b) => b.score - a.score)
    console.log(rankedPlayersData)

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
    else return 0 // If the player wasn't found, there is a problem in the conversion, return 0 (throw exception?)
  }
  const handleNextBoard = () => {
    if (readBoards) {
      if (Object.keys(readBoards).length - 1 === currentBoard) setCurrentBoard(0)
      else setCurrentBoard(currentBoard + 1)
    }
  }
  const handlePrevBoard = () => {
    if (readBoards) {
      if (currentBoard === 0) setCurrentBoard(Object.keys(readBoards).length - 1)
      else setCurrentBoard(currentBoard - 1)
    }
  }
  const openScoreBoard = () => {
    setSbOpened(!sbOpened)
  }
  const initialSquares: SquareState[] = Array.from({ length: mapLength }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))
  let firstPlayerSquares
  let boardName: string = ''
  if (readBoards) {
    firstPlayerSquares = Object.values(readBoards)[currentBoard]?.[0] ?? initialSquares
    if (Object.keys(readBoards)[currentBoard] && Object.keys(readBoards)[currentBoard] === uniqueId) boardName = 'Your'
    else boardName = Object.values(readBoards)[currentBoard]?.[1] + "'s" ?? ''
  }

  const emptyRows = new Array(6 - Object.keys(playerInfos).length).fill(null)

  const isEven = (number: number) => number % 2 === 0

  const getBgColor = (index: number) => {
    let bgColor = ''
    const evenRow = isEven(emptyRows.length) !== isEven(index)
    if (evenRow) {
      bgColor = 'bg-lightpurple lg:bg-grey'
    } else {
      bgColor = 'bg-grey lg:bg-lightpurple'
    }
    return bgColor
  }
  return (
    <div
      id="slide-in"
      className={`${
        sbOpened &&
        'w-screen h-screen transform-gpu duration-200 transition ease-in-out absolute mobilebottom left-0 z-[100] flex flex-col justify-end items-end'
      } `}>
      <button
        id="scoreArrow"
        className={`${sbOpened ? '-translate-y-[548px] static z-50' : ''}
      absolute w-full transform-gpu duration-300 transition ease-out
       mobilebottom h-[48px] left-0 flex items-center justify-center bg-lightpurple lg:hidden z-50`}
        onClick={openScoreBoard}>
        <svg width="47" height="21" viewBox="0 0 47 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M47 19.9298L23.651 -1.02062e-06L0.236751 20.043L23.651 15.1738L47 19.9298Z" fill="white" />
        </svg>
      </button>
      <aside
        id="fade-in"
        className={`${sbOpened ? 'w-full transform-gpu duration-200 transition ease-in-out' : 'hidden lg:flex'}
      mt-24 lg:mt-9 w-[335px] bg-grey flex flex-col h-[600px] lg:h-[500px] justify-start items-center gap-2 relative`}>
        <div id="fade-in-fast" className={`flex flex-col text-xl text-white w-full items-center text-center`}>
          {Object.entries(playerInfos).map(([playerId, { name, score, avatar }]) => (
            <div
              key={playerId}
              className={`${
                getRankByPlayerId(playerId) % 2 === 0 ? 'bg-lightpurple lg:bg-grey' : 'bg-grey lg:bg-lightpurple'
              } text-darkblue w-full h-12 lg:h-10 justify-start items-center flex relative`}>
              <div className="ml-4">{getRankByPlayerId(playerId)}</div>
              <div className="ml-4">
                <Image height={30} width={30} src={`/avatars/avatars-${avatar}.png`} alt="playeravatar" unoptimized></Image>
              </div>
              <div className="ml-4 text-lg">{playerId === uniqueId ? name + ' (you)' : name}</div>
              <div className="mr-4 absolute right-2">
                {score} {scoreText}
              </div>
            </div>
          ))}
          {Object.entries(emptyRows).map((_, index) => (
            <div
              key={index}
              className={`${getBgColor(index)}
             text-darkblue w-full h-12 justify-start items-center flex `}></div>
          ))}
        </div>
        {needBoard && firstPlayerSquares && (
          <div className="absolute  w-full justify-center  bottom-12 lg:bottom-8 gap-4 z-50 flex h-[200px] lg:h-[165px] ">
            <button className="z-20 text-3xl text-white mb-6" onClick={handlePrevBoard}>
              &#10094;
            </button>
            <div className="flex flex-col items-center justify-center">
              <div className="h-[196px] w-[196px] lg:h-[165px] lg:w-[165px] grid grid-cols-7 grid-rows-7">
                {firstPlayerSquares.map(({ accepts, lastDroppedItem, hasStar }, squareIndex) => (
                  <MiniSquare accept={accepts} lastDroppedItem={lastDroppedItem} hasStar={hasStar} index={squareIndex} key={`${squareIndex}`} />
                ))}
              </div>
              <p className="text-darkblue mt-2">{boardName} map</p>
            </div>
            <button className="z-20 text-3xl text-white mb-6" onClick={handleNextBoard}>
              &#10095;
            </button>
          </div>
        )}
      </aside>
    </div>
  )
})

export default ScoreBoard
