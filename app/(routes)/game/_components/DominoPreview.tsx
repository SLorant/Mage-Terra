import { usePreview } from 'react-dnd-preview'
import Image from 'next/image'
import { CSSProperties } from 'react'
import { DominoPreviewProps, DominoState } from '@/app/_components/Interfaces'
export const DominoPreview = ({ isTurned }: DominoPreviewProps) => {
  const preview = usePreview()
  if (!preview.display) {
    return null
  }
  const { item, style } = preview as { itemType: string; item: DominoState; style: CSSProperties }
  return (
    <div className={`${isTurned ? 'flex-col turneddomino mb-20' : ' '} z-50 flex `} style={style}>
      <div className={`h-[14.5vw] w-[14.5vw] md:h-auto md:w-auto ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
        <Image src={item.img} alt="kep" width={20} height={20} className={`w-full h-full`} draggable="false" unoptimized />
      </div>
      <div className={`h-[14.5vw] w-[14.5vw] md:h-auto md:w-auto ring-2 bg-yellow-500 ring-gray-200 shadow-lg z-20 dominoimg`} data-testid="Domino">
        <Image src={item.secondimg} alt="kep" width={20} height={20} className={`w-full h-full`} draggable="false" unoptimized />
      </div>
    </div>
  )
}
