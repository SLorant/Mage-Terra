import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { onValue, ref, update, set } from 'firebase/database'
import { DominoState, TradingProps } from '../../../_components/Interfaces'
import { projectDatabase } from '@/firebase/config'

const Trading = ({ room, uniqueId, Domino, round, hostId, setIsRoundOver }: TradingProps) => {
  const [dominoes, setDominoes] = useState<{ [playerId: string]: [DominoState, string, string] }>({})
  const [newDominoes, setNewDominoes] = useState<{ [playerId: string]: [DominoState] }>({})
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    let timer: NodeJS.Timer

    if (round > 1 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1)
      }, 1000)
    }

    if (countdown === 0) {
    }

    return () => {
      clearInterval(timer)
    }
  }, [countdown, round])

  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const updatedDominoes: { [playerId: string]: [DominoState, string, string] } = {}
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const dominoData: DominoState = userSnapshot.child('Domino').val()
          const nameData: string = userSnapshot.child('Name').val()
          const avatarData: string = userSnapshot.child('Avatar').val()
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
      const dominoRef = ref(projectDatabase, `/${room}/TradingDominoes`)
      const roomRef = ref(projectDatabase, `/${room}`)
      console.log(hostId)
      return onValue(dominoRef, (snapshot) => {
        const data = snapshot.val()
        const updatedDominoes: { [playerId: string]: [DominoState] } = {}
        if (data && Object.values(data).length > 1) {
          snapshot.forEach((userSnapshot) => {
            const playerId: string = userSnapshot.key ?? ''
            const dominoData: DominoState = snapshot.child(`${playerId}`).val()
            if (dominoData !== null) {
              updatedDominoes[playerId] = [dominoData]
              //setDominoes((prevDominoes) => ({ ...prevDominoes, [playerId]: dominoData }))
            }
            const playerRef = ref(projectDatabase, `/${room}/${playerId}`)
          })
          setNewDominoes(updatedDominoes)
        }
      })
    }
    return
  }, [round])

  useEffect(() => {
    if (uniqueId === hostId) {
      if (Object.keys(newDominoes).length > 1 && countdown === 0) {
        const roomRef = ref(projectDatabase, `/${room}`)
        return onValue(
          roomRef,
          (snapshot) => {
            snapshot.forEach((userSnapshot) => {
              const playerId: string = userSnapshot.key ?? ''
              const dominoData: string = userSnapshot.child('Domino').val()
              if (dominoData && Object.keys(newDominoes).includes(`${playerId}`)) {
                const playerRef = ref(projectDatabase, `/${room}/${playerId}/Domino`)

                const {
                  [playerId]: [],
                  ...rest
                } = newDominoes
                const domino = rest
                console.log
                const randomIndex = Math.floor(Math.random() * Object.keys(domino).length)
                const dominoRef = ref(projectDatabase, `/${room}/TradingDominoes/${Object.keys(domino)[randomIndex]}`)
                console.log(Object.keys(domino)[randomIndex])
                set(playerRef, Object.values(domino)[randomIndex][0])
                set(dominoRef, null)
                setIsRoundOver(true)
              }
            })
          },
          {
            onlyOnce: true,
          },
        )
      }
    }
    return
  }, [newDominoes, countdown])
  console.log(newDominoes)
  return (
    <div className="flex items-center flex-col justify-around absolute top-0 left-0  w-[630px] h-full z-50 bg-[#110928]">
      <div className="w-full h-[80px] flex items-center justify-center">
        <h1 className="text-white text-4xl">Trading</h1>
      </div>
      <div className="text-white">{countdown} seconds left</div>
      <div className={`grid-cols-3 grid w-full mt-4 gap-4`}>
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
