import update from 'immutability-helper'
import { SquareState } from './Interfaces'

export const MapSetter = (Squares: SquareState[]): SquareState[] => {
  const specificIndexes = [40, 21, 3, 41, 35, 12] // Specific indexes to set with empty values

  const newSquares = update(Squares, {
    [4]: { lastDroppedItem: { $set: { firstname: 'Dungeon', img: '/dominoes/dungeon-05.webp' } } },
    [7]: { lastDroppedItem: { $set: { firstname: 'Lagoon', img: '/dominoes/lagoon-02.webp' } } },
    [46]: { lastDroppedItem: { $set: { firstname: 'Mt', img: '/dominoes/mountain-01.webp' } } },
    [24]: { lastDroppedItem: { $set: { firstname: 'DungeonLagoonMtVillageFieldRuin', img: '/dominoes/tower.webp' } } },
    [10]: { hasStar: { $set: true } },
    [43]: { hasStar: { $set: true } },
    [32]: { hasStar: { $set: true } },
    ...specificIndexes.reduce((result: Record<number, any>, index) => {
      if (Squares[index]) {
        result[index] = { accepts: { $set: ['W'] } }
      }
      return result
    }, {}),
  })
  return newSquares
}
