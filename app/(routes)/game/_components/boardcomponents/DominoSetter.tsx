import { DominoState } from '../../../../_components/Interfaces'

export const DominoSetter = (): DominoState => {
  const nameArray: string[] = ['Dungeon', 'Lagoon', 'Mt', 'Village', 'Field']
  const imgArray: string[][] = [
    [
      '/dominoes/dungeon-01.webp',
      '/dominoes/dungeon-02.webp',
      '/dominoes/dungeon-03.webp',
      '/dominoes/dungeon-04.webp',
      '/dominoes/dungeon-05.webp',
      '/dominoes/dungeon-06.webp',
    ],
    [
      '/dominoes/lagoon-01.webp',
      '/dominoes/lagoon-02.webp',
      '/dominoes/lagoon-03.webp',
      '/dominoes/lagoon-04.webp',
      '/dominoes/lagoon-05.webp',
      '/dominoes/lagoon-06.webp',
    ],
    [
      '/dominoes/mountain-01.webp',
      '/dominoes/mountain-02.webp',
      '/dominoes/mountain-03.webp',
      '/dominoes/mountain-04.webp',
      '/dominoes/mountain-05.webp',
      '/dominoes/mountain-06.webp',
    ],
    [
      '/dominoes/village-01.webp',
      '/dominoes/village-02.webp',
      '/dominoes/village-03.webp',
      '/dominoes/village-04.webp',
      '/dominoes/village-05.webp',
      '/dominoes/village-06.webp',
    ],
    [
      '/dominoes/field-01.webp',
      '/dominoes/field-02.webp',
      '/dominoes/field-03.webp',
      '/dominoes/field-04.webp',
      '/dominoes/field-05.webp',
      '/dominoes/field-06.webp',
    ],
  ]
  const randomItemIndex = Math.floor(Math.random() * nameArray.length)
  const randomItemIndex2 = Math.floor(Math.random() * nameArray.length)
  const randomImage = Math.floor(Math.random() * 6)
  const randomImage2 = Math.floor(Math.random() * 6)
  const [randomName, randomName2] = [nameArray[randomItemIndex], nameArray[randomItemIndex2]]
  const [randomImg, randomImg2] = [imgArray[randomItemIndex][randomImage], imgArray[randomItemIndex2][randomImage2]]
  const Domino: DominoState = { firstname: randomName, img: randomImg, secondname: randomName2, secondimg: randomImg2 }
  return Domino
}
