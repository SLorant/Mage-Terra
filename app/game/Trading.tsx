import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { onValue, ref, update } from 'firebase/database'
import { DominoState, TradingProps } from './Interfaces'
import { projectDatabase } from '@/firebase/config'

const Trading = ({ room, uniqueId, Domino, round, hostId }: TradingProps) => {
  const [dominoes, setDominoes] = useState<{ [playerId: string]: [DominoState, string, string] }>({}) // Initialize as empty object
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const updatedDominoes: { [playerId: string]: [DominoState, string, string] } = {}
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const dominoData: DominoState = userSnapshot.child('Domino').val()
          const nameData: string = userSnapshot.child('Name').val()
          const avatarData: string = userSnapshot.child('Avatar').val()
          console.log(playerId)
          if (dominoData !== null && nameData !== null && playerId !== uniqueId) {
            updatedDominoes[playerId] = [dominoData, nameData, avatarData]
            //setDominoes((prevDominoes) => ({ ...prevDominoes, [playerId]: dominoData }))
          }
        })
        setDominoes(updatedDominoes)
      }
    })
  }, [])

  const tradeDomino = () => {
    const dominoRef = ref(projectDatabase, `/${room}/TradingDominoes`)
    update(dominoRef, { [uniqueId]: Domino })
  }

  useEffect(() => {
    if (uniqueId === hostId) {
    }
  }, [round])
  return (
    <div className="flex items-center flex-col justify-around absolute top-0 left-0  w-[630px] h-full z-50 bg-[#110928]">
      <div className="w-full h-[80px] flex items-center justify-center">
        <h1 className="text-white text-4xl">Trading</h1>
      </div>
      <div className={`grid-cols-${Object.values(dominoes).length - 1} grid w-full mt-4 gap-4`}>
        {Object.values(dominoes).map(([domino, name, avatar], index) => (
          <div className="flex items-center justify-center flex-col " key={index}>
            <div className="">
              <Image height={80} width={80} src={`/avatar-${avatar}.png`} alt="playeravatar" unoptimized></Image>
            </div>
            <p className="text-white text-xl">{name}</p>
            <div style={{ border: '1px dashed gray' }} className={`w-[120px] h-[60px]  flex  mt-6`}>
              <div className={`w-[60px] h-[60px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
                <Image src={domino.img} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
              <div className={`w-[60px] h-[60px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
                <Image src={domino.secondimg} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ border: '1px dashed gray' }} className={`w-[160px] h-[80px] mb-10'} cursor-move flex  mt-6`}>
        <div className={`w-[80px] h-[80px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          <Image src={Domino.img} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
        </div>
        <div className={`w-[80px] h-[80px] ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20`} data-testid="Domino">
          <Image src={Domino.secondimg} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
        </div>
      </div>
      <div className="text-white">
        <button>Keep</button>
        <button onClick={tradeDomino} className="ml-4 p-4 bg-green rounded-md text-2xl">
          Trade
        </button>
      </div>
    </div>
  )
}

export default Trading
