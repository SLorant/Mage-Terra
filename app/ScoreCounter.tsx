interface SquareState {
  accepts: string[]
  lastDroppedItem: any
}

export const ScoreCounter = (squares: SquareState[]): number => {
  const maxSequenceLengths: { [type: string]: number } = {}
  const visited: boolean[] = Array(squares.length).fill(false)

  for (let i = 0; i < squares.length; i++) {
    const type = squares[i].lastDroppedItem?.firstname
    if (!visited[i] && type) {
      const sequenceLength = getConnectedSequenceLength(i, type)
      if (!maxSequenceLengths[type] || sequenceLength > maxSequenceLengths[type]) {
        maxSequenceLengths[type] = sequenceLength
      }
    }
  }

  return Object.values(maxSequenceLengths).reduce((sum, length) => sum + length, 0)

  function getConnectedSequenceLength(squareIndex: number, type: string): number {
    if (
      squareIndex < 0 ||
      squareIndex >= squares.length ||
      visited[squareIndex] ||
      squares[squareIndex].lastDroppedItem?.firstname !== type
    ) {
      return 0
    }

    visited[squareIndex] = true
    const neighbors = [
      squareIndex - 1, // left neighbor
      squareIndex + 1, // right neighbor
      squareIndex - 8, // top neighbor
      squareIndex + 8, // bottom neighbor
    ]
    let sequenceLength = 1

    for (const neighbor of neighbors) {
      sequenceLength += getConnectedSequenceLength(neighbor, type)
    }

    return sequenceLength
  }
}

/* 
interface DominoState {
  firstname: string
  secondname: string
  img: string
  secondimg: string
}
type DroppedDomino = [number, number, DominoState]

interface ScoreCounterProps {
  droppedDominoes: DroppedDomino[]
}

export const ScoreCounter = ({ droppedDominoes }: ScoreCounterProps): number => {
  let firstnamecounter: number = 0
  let typeinsequence: number = 0
  droppedDominoes.forEach((element) => {
    if (element[2].firstname == 'F') firstnamecounter++
    if (element[2].secondname == 'F') firstnamecounter++
  })
  return firstnamecounter
}
 */
