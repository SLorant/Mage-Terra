import { SquareState } from "../../../components/Interfaces";
import { rowLength } from "./boardcomponents/MapConfig";

export const ScoreCounter = (squares: SquareState[]): number => {
  const maxSequenceLengths: {
    [type: string]: { length: number; starCount: number };
  } = {};
  const visited: boolean[] = Array(squares.length).fill(false);
  const visitedForStar: boolean[] = Array(squares.length).fill(false);

  for (let i = 0; i < squares.length; i++) {
    const type = squares[i].lastDroppedItem?.firstname;
    if (!visited[i] && type) {
      const sequence = getConnectedSequence(i, type, false);
      const sequenceLength = sequence.length;
      const starCount = sequence.filter((square) => square.hasStar).length;
      if (
        !maxSequenceLengths[type] ||
        sequenceLength > maxSequenceLengths[type].length
      ) {
        maxSequenceLengths[type] = {
          length: sequenceLength,
          starCount: starCount,
        };
      }
    }
  }

  let score = 0;
  for (const type in maxSequenceLengths) {
    const sequenceLength = maxSequenceLengths[type].length;
    const starCount = maxSequenceLengths[type].starCount;
    if (starCount === 0) score += sequenceLength;
  }

  for (let i = 0; i < squares.length; i++) {
    const type = squares[i].lastDroppedItem?.firstname;
    if (!visitedForStar[i] && type) {
      const sequence = getConnectedSequence(i, type, true);
      const starCount = sequence.filter((square) => square.hasStar).length;
      if (starCount > 0) {
        score += sequence.length * (starCount + 1);
      }
    }
  }

  return score;

  function getConnectedSequence(
    squareIndex: number,
    type: string,
    forStar: boolean
  ): SquareState[] {
    if (
      squareIndex < 0 ||
      squareIndex >= squares.length ||
      (forStar ? visitedForStar[squareIndex] : visited[squareIndex]) ||
      squares[squareIndex].lastDroppedItem?.firstname !== type
    ) {
      return [];
    }

    forStar
      ? (visitedForStar[squareIndex] = true)
      : (visited[squareIndex] = true);
    const neighbors = [
      squareIndex - 1, // left neighbor
      squareIndex + 1, // right neighbor
      squareIndex - rowLength, // top neighbor
      squareIndex + rowLength, // bottom neighbor
    ];
    const sequence = [squares[squareIndex]];

    for (const neighbor of neighbors) {
      sequence.push(...getConnectedSequence(neighbor, type, forStar));
    }

    return sequence;
  }
};
