import update from 'immutability-helper'
import { SquareState } from './Interfaces'

export const MapSetter = (Squares: SquareState[]): SquareState[] => {
  const specificIndexes = [40, 21, 3, 41, 35, 12] // Specific indexes to set with empty values

  const newSquares = update(Squares, {
    [4]: { lastDroppedItem: { $set: { firstname: 'Cave', img: '/cave-05.svg' } } },
    [7]: { lastDroppedItem: { $set: { firstname: 'Swamp', img: '/swamp-02.svg' } } },
    [46]: { lastDroppedItem: { $set: { firstname: 'Mt', img: '/mountains-01.svg' } } },
    [24]: { lastDroppedItem: { $set: { firstname: 'CaveSwampMtCityFieldRuin', img: '/br.jpg' } } },
    [10]: { hasStar: { $set: true } },
    [43]: { hasStar: { $set: true } },
    [32]: { hasStar: { $set: true } },
    ...specificIndexes.reduce((result: Record<number, any>, index) => {
      if (Squares[index]) {
        result[index] = { accepts: { $set: [] } }
      }
      return result
    }, {}),
  })
  return newSquares
}
