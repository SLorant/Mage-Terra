interface SquareState {
  accepts: string[]
  lastDroppedItem: any
}

export const ScoreCounter = (squares: SquareState[]): number => {
  let maxSequenceLength: number = 0
  const visited: boolean[] = Array(squares.length).fill(false)

  for (let i = 0; i < squares.length; i++) {
    if (!visited[i] && squares[i].lastDroppedItem?.firstname === 'F') {
      const sequenceLength = getConnectedSequenceLength(i)
      if (sequenceLength > maxSequenceLength) {
        maxSequenceLength = sequenceLength
      }
    }
  }

  return maxSequenceLength

  function getConnectedSequenceLength(squareIndex: number): number {
    if (
      squareIndex < 0 ||
      squareIndex >= squares.length ||
      visited[squareIndex] ||
      squares[squareIndex].lastDroppedItem?.firstname !== 'F'
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
      sequenceLength += getConnectedSequenceLength(neighbor)
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
