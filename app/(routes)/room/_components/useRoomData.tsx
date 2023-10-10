import { set, ref, onValue, update, DataSnapshot } from 'firebase/database'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { projectDatabase } from '@/firebase/config'

export const useRoomData = (room: string, uniqueId: string, wentBack: boolean) => {
  const [hostId, setHostId] = useState('')
  const router = useRouter()
  const [currentPlayers, setCurrentPlayers] = useState(100)
  const [readNames, setReadNames] = useState<{ [key: string]: { Name: string; Avatar: number } }>({})
  const firstRender = useRef(true)
  const [quickPlay, setQuickPlay] = useState<boolean>(false)
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}`)
    const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
    const handleRoomData = (snapshot: DataSnapshot) => {
      const data = snapshot.val()
      if (data) {
        const { gameStarted, Host, doneWithAction, quickPlay, countDown, Map, round, DisconnectedPlayers, Dominoes, pickerPlayer, arcanes, ...playersData } =
          data
        if (!wentBack) {
          setHostId(Host || uniqueId)
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, Host || uniqueId)
        } else {
          const dataRef = ref(projectDatabase, `/${room}/Host`)
          set(dataRef, null)
        }
        if (firstRender.current) {
          setReadNames(playersData)
          firstRender.current = false
        }
        if (quickPlay) setQuickPlay(true)
        if (Host) {
          //Make the host always the first player in the grid
          const sortedNamesArray = Object.entries(playersData).sort((a, b) => {
            if (a[0] === Host) return -1 // Move host player to the beginning
            if (b[0] === Host) return 1
            return 0
          })
          const sortedReadNames = sortedNamesArray.reduce((obj: any, [key, value]) => {
            obj[key] = value
            return obj
          }, {})
          setReadNames(sortedReadNames)
        }
        if (currentPlayers !== Object.keys(playersData).length) setCurrentPlayers(Object.keys(playersData).length)
        if (uniqueId) {
          if (gameStarted === true) {
            router.push(`/game?roomId=${room}`)
          } /*  else if (gameStarted === true && Map) {
            const discRef = ref(projectDatabase, `/${room}/DisconnectedPlayers`)
            update(discRef, { [uniqueId]: true })
            set(playerRef, null)
            router.push('/')
          } */
        }
      }
    }

    return onValue(roomRef, handleRoomData)
  }, [room, uniqueId, currentPlayers])

  return { hostId, readNames, setReadNames, currentPlayers, quickPlay }
}
