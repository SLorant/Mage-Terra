import { DominoPickerProps, DominoState, SquareState } from '@/app/_components/Interfaces'
import React, { useEffect, useState } from 'react'
import { usePlayerStore } from '@/app/_components/useStore'
import { projectDatabase } from '@/firebase/config'
import { onValue, ref, set, update } from 'firebase/database'
import { DominoSetter } from './boardcomponents/DominoSetter'
import Image from 'next/image'

const DominoPicker = ({ uniqueId, hostId, room, countDown, originalDomino, setDomino, readBoards }: DominoPickerProps) => {
  const { playerCount } = usePlayerStore()
  const [dominoes, setDominoes] = useState<DominoState[]>([])
  const [playerInfos2, setPlayerInfos2] = useState<{ [key: string]: [name: string, score: number] }>({})
  const [playerDominoes, setPlayerDominoes] = useState<{ [key: string]: [name: string, domino: DominoState] }>({})
  const [pickingCountDown, setPickingCountDown] = useState(15)

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`)
    const dominoesRef = ref(projectDatabase, `/${room}/Dominoes`)
    // or last picker's round ends
    if (Object.keys(playerDominoes).length === playerCount) {
      set(playersRef, null)
      set(dominoesRef, null)
    }
  }, [playerDominoes])
  useEffect(() => {
    const dominoesRef = ref(projectDatabase, `/${room}/Dominoes`)
    if (hostId === uniqueId) {
      for (let i = 0; i < playerCount; i++) {
        const Domino = DominoSetter()
        update(dominoesRef, { [i]: Domino })
      }
    }

    return onValue(dominoesRef, (snapshot) => {
      const data: DominoState[] = snapshot.val()
      if (data) {
        setDominoes(data)
      } else setDominoes([])
    })
  }, [uniqueId, room, hostId])
  useEffect(() => {
    readBoards &&
      Object.entries(readBoards).forEach((board) => {
        let greens: number = 0
        console.log(board)
        board[1][0].forEach((square) => {
          if (square.lastDroppedItem?.firstname === 'Mt') {
            greens++
          }
        })
        /*  setPlayerInfos2((prevInfos) => ({
          ...prevInfos,
          [board[0]]: [board[1][1] ,greens],
        })) */
        setPlayerInfos2((prevPlayerInfos) => {
          const updatedPlayerInfos: { [key: string]: [string, number] } = {
            ...prevPlayerInfos,
            [board[0]]: [board[1][1], greens],
          }
          const sortedPlayerInfosArray: [string, [string, number]][] = Object.entries(updatedPlayerInfos).sort(([_, a], [__, b]) => b[1] - a[1])
          const sortedPlayerInfos = Object.fromEntries(sortedPlayerInfosArray)
          return sortedPlayerInfos
        })
      })
  }, [readBoards])

  const [dominoIndex, setDominoIndex] = useState<number>(30)
  const [canPick, setCanPick] = useState<boolean>(false)
  const [picker, setPicker] = useState<string>('')
  const [currentPicker, setCurrentPicker] = useState<number>(0)
  const chooseDomino = (Domino: DominoState, index: number) => {
    if (dominoIndex === 30 && canPick) {
      setDominoIndex(index)
      setDomino(Domino)
      const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`)
      if (uniqueId) {
        const updateObject = { [uniqueId]: [index, Domino] }
        update(playersRef, updateObject)
      }
    }
  }
  useEffect(() => {
    if (canPick) {
      let timer: NodeJS.Timer
      if (pickingCountDown) {
        timer = setInterval(() => {
          setPickingCountDown((prevCountdown) => prevCountdown - 1)
        }, 1000)
      }
      if (pickingCountDown === 0) {
        const playersRef = ref(projectDatabase, `/${room}/doneWithDomino`)
        if (uniqueId) {
          const updateObject = { [uniqueId]: [30, originalDomino] }
          update(playersRef, updateObject)
        }
      }
      return () => {
        clearInterval(timer)
      }
    }
  }, [canPick, pickingCountDown])
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}/pickerPlayer`)
    const doneRef = ref(projectDatabase, `/${room}/doneWithDomino`)
    onValue(doneRef, (snapshot) => {
      const data = snapshot.val()
      // console.log(currentPicker)
      if (uniqueId === hostId && Object.values(playerInfos2).length > 1) {
        set(roomRef, Object.keys(playerInfos2)[currentPicker])
      }
      if (data && currentPicker < playerCount - 1) {
        setCurrentPicker(currentPicker + 1)
      }
      if (data) {
        snapshot.forEach((userSnapshot) => {
          const playerId: string = userSnapshot.key ?? ''
          const num: number = userSnapshot.child('0').val()
          const domino: DominoState = userSnapshot.child('1').val()
          let name = ''
          Object.entries(playerInfos2).forEach((player) => {
            if (playerId === player[0]) name = player[1][0]
          })
          setPlayerDominoes((prevDominoes) => ({
            ...prevDominoes,
            [playerId]: [name, domino],
          }))
          if (uniqueId === hostId) {
            const dominoRef = ref(projectDatabase, `/${room}/Dominoes/${num}`)
            set(dominoRef, null)
          }
        })
        //set(roomRef, Object.keys(playerInfos2)[currentPicker + 1])
      }
    })
    return onValue(roomRef, (snapshot) => {
      const data: string = snapshot.val()
      setPicker(data)
      if (data && data === uniqueId) {
        setCanPick(true)
      } else setCanPick(false)
    })
  }, [playerInfos2])
  return (
    <div className="absolute top-10 left-10 w-[1000px] bg-lightpurple h-[500px] z-50 flex gap-10">
      {pickingCountDown}
      <div className="flex gap-10 flex-col">
        {dominoes.map((Domino, index) =>
          index === 30 ? (
            <div>None</div>
          ) : (
            <div className={`${dominoIndex === index && 'opacity-20'} flex`} key={index} onClick={() => chooseDomino(Domino, index)}>
              <div className={` ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
                <Image src={Domino.img} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
              <div className={` ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
                <Image src={Domino.secondimg} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
            </div>
          ),
        )}
      </div>
      <div>
        {Object.entries(playerInfos2).map(([playerId, [name, score]]) => (
          <div key={playerId}>
            {playerId === picker && <div>{name} is picking a domino!</div>}
            {name}:{score}
          </div>
        ))}
      </div>
      <div>
        {Object.entries(playerDominoes).map(([playerId, [name, domino]]) => (
          <div key={playerId}>
            {name} picked this domino:
            <div className="flex">
              <div className={` ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
                <Image src={domino.img} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
              <div className={` ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
                <Image src={domino.secondimg} alt="kep" width={80} height={80} className={`w-full h-full`} draggable="false" unoptimized />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DominoPicker
