import { SquareState } from './Interfaces'
import { rowLength } from './MapConfig'
export const ScoreCounter = (squares: SquareState[]): number => {
  const maxSequenceLengths: { [type: string]: { length: number; starCount: number } } = {}
  const visited: boolean[] = Array(squares.length).fill(false)

  for (let i = 0; i < squares.length; i++) {
    const type = squares[i].lastDroppedItem?.firstname
    if (!visited[i] && type) {
      const sequence = getConnectedSequence(i, type)
      const sequenceLength = sequence.length
      const starCount = sequence.filter((square) => square.hasStar).length

      if (!maxSequenceLengths[type] || sequenceLength > maxSequenceLengths[type].length) {
        maxSequenceLengths[type] = { length: sequenceLength, starCount: starCount }
      }
    }
  }

  let score = 0
  for (const type in maxSequenceLengths) {
    const sequenceLength = maxSequenceLengths[type].length
    const starCount = maxSequenceLengths[type].starCount
    const sequenceScore = sequenceLength * (starCount + 1)
    score += sequenceScore
  }

  return score

  function getConnectedSequence(squareIndex: number, type: string): SquareState[] {
    if (squareIndex < 0 || squareIndex >= squares.length || visited[squareIndex] || squares[squareIndex].lastDroppedItem?.firstname !== type) {
      return []
    }

    visited[squareIndex] = true
    const neighbors = [
      squareIndex - 1, // left neighbor
      squareIndex + 1, // right neighbor
      squareIndex - rowLength, // top neighbor
      squareIndex + rowLength, // bottom neighbor
    ]
    const sequence = [squares[squareIndex]]

    for (const neighbor of neighbors) {
      sequence.push(...getConnectedSequence(neighbor, type))
    }

    return sequence
  }
}
