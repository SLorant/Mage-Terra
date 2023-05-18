import { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'

export default function useAdjacentSquare(index: number) {
  const [isAdjacentActive, setIsAdjacentActive] = useState(false)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.WATER,
    drop: () => setIsAdjacentActive(false),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  useEffect(() => {
    const isAdjacentDustbinActive =
      (index % 10 > 0 && isOver && canDrop) ||
      (index % 10 < 9 && isOver && canDrop) ||
      (index > 9 && isOver && canDrop) ||
      (index < 90 && isOver && canDrop)
    setIsAdjacentActive(isAdjacentDustbinActive)
  }, [index, isOver, canDrop])

  return isAdjacentActive
}
