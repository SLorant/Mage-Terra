import update from 'immutability-helper'
import { SquareState } from './Interfaces'

export const MapSetter = (Squares: SquareState[]): SquareState[] => {
  const specificIndexes = [60, 62, 63, 60, 59, 43] // Specific indexes to set with empty values

  const newSquares = update(Squares, {
    [4]: { lastDroppedItem: { $set: { firstname: 'Cave', img: '/cave-05.svg' } } },
    [25]: { lastDroppedItem: { $set: { firstname: 'Swamp', img: '/swamp-02.svg' } } },
    [55]: { lastDroppedItem: { $set: { firstname: 'Mt', img: '/mountains-01.svg' } } },
    [28]: { lastDroppedItem: { $set: { firstname: 'CaveSwampMtCityFieldRuin', img: '/br.jpg' } } },
    [10]: { hasStar: { $set: true } },
    [49]: { hasStar: { $set: true } },
    [61]: { hasStar: { $set: true } },
    ...specificIndexes.reduce((result: Record<number, any>, index) => {
      if (Squares[index]) {
        result[index] = { accepts: { $set: [] } }
      }
      return result
    }, {}),
  })
  return newSquares
}
