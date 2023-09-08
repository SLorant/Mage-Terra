import update from 'immutability-helper'
import { MapSetterProps, SquareState } from './Interfaces'
import { onValue, ref, set } from 'firebase/database'
import { projectDatabase } from '@/firebase/config'
import { useState, useEffect } from 'react'

export const useMapSetter = ({ Squares, uniqueId, room, mapLoaded }: MapSetterProps): SquareState[] => {
  //const [currentMap, setCurrentMap] = useState<SquareState[]>([])
  /*   console.log(Squares)
  console.log(uniqueId)
  console.log(room) */
  const [currentMap, setCurrentMap] = useState<SquareState[]>([])
  const setMap = (mapCode: number): SquareState[] => {
    if (mapCode === 1) {
      const specificIndexes = [0, 1, 33, 45] // Specific indexes to set with empty values

      const newSquares = update(Squares, {
        [12]: { lastDroppedItem: { $set: { firstname: 'Dungeon', img: '/dominoes/dungeon-05.webp' } } },
        [28]: { lastDroppedItem: { $set: { firstname: 'Lagoon', img: '/dominoes/lagoon-02.webp' } } },
        [24]: { lastDroppedItem: { $set: { firstname: 'DungeonLagoonMtVillageFieldRuin', img: '/dominoes/tower.webp' } } },
        [3]: { hasStar: { $set: true } },
        [15]: { hasStar: { $set: true } },
        [40]: { hasStar: { $set: true } },
        ...specificIndexes.reduce((result: Record<number, any>, index) => {
          if (Squares[index]) {
            result[index] = { accepts: { $set: ['W'] } }
          }
          return result
        }, {}),
      })
      return newSquares
    } else if (mapCode === 2) {
      const specificIndexes = [6, 21, 40] // Specific indexes to set with empty values

      const newSquares = update(Squares, {
        [1]: { lastDroppedItem: { $set: { firstname: 'Field', img: '/dominoes/field-03.webp' } } },
        [28]: { lastDroppedItem: { $set: { firstname: 'Village', img: '/dominoes/village-02.webp' } } },
        [41]: { lastDroppedItem: { $set: { firstname: 'Mt', img: '/dominoes/mountain-01.webp' } } },
        [24]: { lastDroppedItem: { $set: { firstname: 'DungeonLagoonMtVillageFieldRuin', img: '/dominoes/tower.webp' } } },
        [8]: { hasStar: { $set: true } },
        [20]: { hasStar: { $set: true } },
        [44]: { hasStar: { $set: true } },
        ...specificIndexes.reduce((result: Record<number, any>, index) => {
          if (Squares[index]) {
            result[index] = { accepts: { $set: ['W'] } }
          }
          return result
        }, {}),
      })
      return newSquares
    } else if (mapCode === 3) {
      const specificIndexes = [6, 12, 27, 43] // Specific indexes to set with empty values

      const newSquares = update(Squares, {
        [9]: { lastDroppedItem: { $set: { firstname: 'Field', img: '/dominoes/field-03.webp' } } },
        [16]: { lastDroppedItem: { $set: { firstname: 'Village', img: '/dominoes/village-02.webp' } } },
        [32]: { lastDroppedItem: { $set: { firstname: 'DungeonLagoonMtVillageFieldRuin', img: '/dominoes/tower.webp' } } },
        [0]: { hasStar: { $set: true } },
        [18]: { hasStar: { $set: true } },
        [44]: { hasStar: { $set: true } },
        ...specificIndexes.reduce((result: Record<number, any>, index) => {
          if (Squares[index]) {
            result[index] = { accepts: { $set: ['W'] } }
          }
          return result
        }, {}),
      })
      return newSquares
    } else if (mapCode === 4) {
      const specificIndexes = [0, 12, 41] // Specific indexes to set with empty values

      const newSquares = update(Squares, {
        [3]: { lastDroppedItem: { $set: { firstname: 'Field', img: '/dominoes/field-03.webp' } } },
        [29]: { lastDroppedItem: { $set: { firstname: 'Village', img: '/dominoes/village-02.webp' } } },
        [45]: { lastDroppedItem: { $set: { firstname: 'Mt', img: '/dominoes/mountain-01.webp' } } },
        [18]: { lastDroppedItem: { $set: { firstname: 'DungeonLagoonMtVillageFieldRuin', img: '/dominoes/tower.webp' } } },
        [7]: { hasStar: { $set: true } },
        [34]: { hasStar: { $set: true } },
        [43]: { hasStar: { $set: true } },
        ...specificIndexes.reduce((result: Record<number, any>, index) => {
          if (Squares[index]) {
            result[index] = { accepts: { $set: ['W'] } }
          }
          return result
        }, {}),
      })
      return newSquares
    } else return []
  }

  //let currentMap: SquareState[] = setMap(2)
  useEffect(() => {
    const roomRef = ref(projectDatabase, `/${room}/Map`)
    const roomRef2 = ref(projectDatabase, `/${room}`)

    if (uniqueId !== undefined && uniqueId !== '' && Squares !== undefined && !mapLoaded.current) {
      const unsubscribe = onValue(roomRef, (snapshot) => {
        const hostData: string = snapshot.child('Host').val()
        const mapData: number = snapshot.child('Map').val()

        if (uniqueId === hostData) {
          if (mapData === undefined || mapData === null) {
            const mapCode = Math.floor(Math.random() * 4) + 1
            set(roomRef, mapCode)
            setCurrentMap(setMap(mapCode))
            //currentMap = setMap(1)
            console.log(mapCode)
          }
        } else {
          if (mapData !== undefined && mapData !== null) {
            console.log(currentMap)
            console.log(mapData)
            //currentMap = setMap(mapData)
            setCurrentMap(setMap(mapData))
          }
        }
      })

      // Clean up the Firebase listener when the component unmounts
      return () => {
        unsubscribe()
      }
    }
  }, [uniqueId, room])
  if (currentMap.length > 0 && currentMap.some((square) => square.lastDroppedItem !== null) && !mapLoaded.current) {
    mapLoaded.current = true
  }

  return currentMap
}
