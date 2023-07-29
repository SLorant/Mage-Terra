'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import { projectDatabase } from '@/firebase/config'
import { ref, onValue, update, onDisconnect, set, get } from 'firebase/database'
import { useState, useEffect, useRef } from 'react'
import { ItemTypes } from '../ItemTypes'
import { useSearchParams } from 'next/navigation'
import { MapSetter } from './MapSetter'
import { SquareState } from './Interfaces'
import ScoreBoard from './ScoreBoard'
import { useRouter } from 'next/navigation'
import useStore from '../IdStore'

export default function Home() {
  const initialSquares: SquareState[] = Array.from({ length: 64 }).map(() => ({
    accepts: [ItemTypes.DOMINO],
    lastDroppedItem: null,
    hasStar: false,
  }))

  const [readSquares, setReadSquares] = useState<SquareState[]>(initialSquares)
  const [readBoards, setReadBoards] = useState<{ [playerId: string]: SquareState[] }>({})

  interface PlayerInfo {
    name: string
    score: number
  }
  const router = useRouter()
  const [playerInfos, setPlayerInfos] = useState<{ [key: string]: PlayerInfo }>({})
  /* const [playerInfos, setPlayerInfos] = useState<number[]>([]) */

  /* type DroppedDominoes = [number, number]
  const [droppedDominoes, setDroppedDominoes] = useState<DroppedDominoes[]>([]) */
  //const [uniqueId, setUniqueId] = useState('')
  const { uniqueId, initializeUniqueId } = useStore()
  const searchParams = useSearchParams()
  const room = searchParams.get('roomId')
  const [isDropped, setIsDropped] = useState<boolean>(false)
  const [round, setRound] = useState<number>(1)
  const [discPlayers, setDiscPlayers] = useState(0)
  const [hostId, setHostId] = useState('')
  const firstRender = useRef(true)

  useEffect(() => {
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}/Disconnected`)
      set(playerRef, false)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.set(true)
    }
  }, [uniqueId])

  useEffect(() => {
    if (firstRender.current === false) {
      setDiscPlayers(0)
      const playersRef = ref(projectDatabase, `/${room}`)
      setIsDropped(false)
      const playerRef = ref(projectDatabase, `/${room}/doneWithAction`)
      if (uniqueId !== '' && uniqueId === hostId) {
        const updateObject = { [uniqueId]: false }
        update(playerRef, updateObject)
      }
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        const dataHost: { Host: string; round: number } = snapshot.val()
        if (data) {
          snapshot.forEach((userSnapshot) => {
            const playerId: string = userSnapshot.key ?? ''
            const squaresData: SquareState[] = userSnapshot.child('Squares').val()
            if (squaresData !== null && playerId !== localStorage.getItem('uniqueId')) {
              setReadSquares(squaresData)
              setReadBoards((prevReadBoards) => ({
                ...prevReadBoards,
                [playerId]: squaresData,
              }))
            }
            const scoreData: number = userSnapshot.child('Score').val()
            const nameData: string = userSnapshot.child('Name').val()
            if (nameData !== null) addPlayerInfo(playerId, nameData, scoreData)

            const discData: boolean = userSnapshot.child('Disconnected').val()
            if (discData && uniqueId === hostId) {
              //console.log(userSnapshot.key)
              setDiscPlayers(discPlayers + 1)
            }
          })
        }
        if (dataHost && dataHost.Host) {
          setHostId(dataHost.Host)
        } else if (uniqueId !== '') {
          setHostId(uniqueId)
          console.log(uniqueId)
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, uniqueId)
        }
      })
    }
  }, [uniqueId, round])

  /*  useEffect(() => {
    console.log(uniqueId)
      const playersRef = ref(projectDatabase, `/${room}/Host`)
      onValue(playersRef, (snapshot) => {
        const dataHost: string = snapshot.val()
        if (dataHost) {
          setHostId(dataHost)
        } else {
          setHostId(uniqueId)
          console.log(uniqueId)
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, uniqueId)
        }
      })
  }, [uniqueId, room]) */

  useEffect(() => {
    const newSquares = MapSetter(readSquares)
    setReadSquares(newSquares)
    console.log('setting map')
    if (firstRender) {
      if (uniqueId === '') {
        initializeUniqueId()
      }
      firstRender.current = false
    }

    console.log(uniqueId)
  }, [])
  console.log(uniqueId)
  useEffect(() => {
    if (uniqueId !== '') {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}/Disconnected`)
      set(playerRef, false)
      /* const playersDisconnectRef = onDisconnect(playersRef)
        playersDisconnectRef.remove() */

      disconnectPlayers()
    }
  }, [discPlayers])

  const disconnectPlayers = async () => {
    const playerRef = ref(projectDatabase, `/${room}/${uniqueId}/Disconnected`)
    const playerDisconnectRef = onDisconnect(playerRef)
    console.log(discPlayers)
    const hostRef = ref(projectDatabase, `/${room}/Host`)
    const hostDisconnectRef = onDisconnect(hostRef)
    hostDisconnectRef.remove()
    await playerDisconnectRef.set(true)
    if (discPlayers > 0 && discPlayers === 2) {
      console.log('asd')
      const playersRef = ref(projectDatabase, `/${room}`)
      //const playersDisconnectRef = onDisconnect(playersRef)
      await set(playersRef, null)
      router.push('/')
      //set(playersRef, null)
    }
  }

  useEffect(() => {
    const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
    const roomRef = ref(projectDatabase, `/${room}`)
    if (uniqueId !== '') {
      const updateObject = { [uniqueId]: isDropped }
      update(playersRef, updateObject)
    }
    if (uniqueId !== '' && uniqueId === hostId) {
      const playersRef = ref(projectDatabase, `/${room}/doneWithAction`)
      onValue(playersRef, (snapshot) => {
        const data = snapshot.val()
        const allTrue = Object.values(data).every((value) => value === true)
        if (allTrue) {
          setRound(round + 1)
          const roundRef = ref(projectDatabase, `/${room}/round`)
          set(roundRef, round + 1)
        }
      })
    }
    onValue(roomRef, (snapshot) => {
      const data: { Host: string; round: number } = snapshot.val()
      if (data && data.round && uniqueId !== hostId) {
        setRound(data.round)
      }
    })
  }, [isDropped])

  const addPlayerInfo = (otherId: string, nameData: string, scoreData: number) => {
    scoreData = scoreData ?? 0
    setPlayerInfos((prevPlayerInfos) => {
      const updatedPlayerInfos = {
        ...prevPlayerInfos,
        [otherId]: { name: nameData, score: scoreData },
      }
      const sortedPlayerInfosArray = Object.entries(updatedPlayerInfos).sort(([, a], [, b]) => b.score - a.score)
      const sortedPlayerInfos = Object.fromEntries(sortedPlayerInfosArray)
      return sortedPlayerInfos
    })
  }
  return (
    <main className="flex h-screen  items-center justify-center font-sans ">
      <div className="flex items-top justify-center gap-10 bg-[#110928] w-[1000px]">
        <div className="mt-20  flex items-center justify-center  bg-purple-700 h-[560px] mb-20 gap-0 shadow-md">
          <DndProvider backend={HTML5Backend}>
            <Board uniqueId={uniqueId} room={room} isDropped={isDropped} setIsDropped={setIsDropped} />
          </DndProvider>
        </div>
        <ScoreBoard uniqueId={uniqueId} playerInfos={playerInfos} readBoards={readBoards} />
      </div>
    </main>
  )
}
