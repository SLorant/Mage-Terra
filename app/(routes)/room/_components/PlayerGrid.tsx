import { PlayerGridProps } from '@/app/_components/Interfaces'
import React from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { HostCrown, Dots } from '@/app/_components/Vectors'

const PlayerGrid = ({ readNames, playerName, uniqueId, hostId }: PlayerGridProps) => {
  const [placeHolders, setPlaceHolders] = useState<JSX.Element[]>([])
  useEffect(() => {
    setPlaceHolders(
      Array.from({ length: 6 - Object.keys(readNames).length }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="md:flex hidden opacity-50 flex w-[300px] mt-8 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple"></div>
      )),
    )
  }, [readNames])

  return (
    <div
      id="fade-in"
      className={` ${
        readNames && Object.keys(readNames).length > 2 ? 'h-[200px] overflow-scroll md:h-auto ' : 'h-[150px] md:h-auto overflow-hidden'
      } md:overflow-hidden grid  w-[auto] gap-x-6
     grid-cols-1 md:h-auto md:grid-cols-2 md:grid-rows-3 avatartable`}>
      {Object.keys(readNames).length > 0 &&
        Object.entries(readNames).map(([playerId, { Name, Avatar }]) => (
          <div id="fade-in" className="relative" key={playerId}>
            <div className="absolute z-40 top-[18px] left-2">
              {Avatar === undefined ? (
                <Image height={55} width={55} src={`/avatars/avatars-1.png`} alt="playeravatar" unoptimized></Image>
              ) : (
                <Image height={55} width={55} src={`/avatars/avatars-${Avatar}.png`} alt="playeravatar" unoptimized></Image>
              )}
            </div>
            <div
              className={`flex w-[300px] justify-between relative mt-8 items-center ml-4 h-[42px]  rounded-[42px] border-2 border-lightpurple
      ${Name.length > 5 ? 'text-lg' : Name.length > 10 ? 'text-md' : 'text-xl'}`}>
              <p className="ml-16 mb-1">
                {Name === playerName && playerId === uniqueId && Name === 'New player'
                  ? 'You'
                  : Name === playerName && playerId === uniqueId
                  ? Name + ' (you)'
                  : Name}
              </p>
              <span className="flex items-center justify-center mr-4 gap-4">
                {playerId === hostId && (
                  <span className="">
                    <HostCrown />
                  </span>
                )}
                {Name === 'New player' && (
                  <span className="">
                    <Dots />
                  </span>
                )}
              </span>
            </div>
          </div>
        ))}
      {placeHolders}
    </div>
  )
}

export default PlayerGrid
