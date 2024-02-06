import { RoundBarProps } from '@/app/_components/Interfaces'
import React, { useEffect, useState } from 'react'
import { projectDatabase } from '@/firebase/config'
import { onValue, ref, set } from 'firebase/database'

const RoundBar = ({ round, setArcaneType, room, uniqueId, hostId }: RoundBarProps) => {
  const [arcaneColors, setArcaneColors] = useState<string[]>([])
  const [arcanes, setArcanes] = useState<string[]>([])
  const arcaneList = { Dungeon: '#9000BD', Lagoon: '#FF40B1', Mt: '#35CB8F', Village: '#184BC2', Field: '#E29D6B' }

  useEffect(() => {
    const arcaneRef = ref(projectDatabase, `/${room}/arcanes`)
    onValue(arcaneRef, (snapshot) => {
      const data: string[] = snapshot.val()
      if (uniqueId && uniqueId !== hostId) {
        setArcanes(data)
      }
    })

    if (uniqueId === hostId && arcanes.length < 4) {
      let tempArcanes = []
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * Object.entries(arcaneList).length)
        setArcaneColors((prevArcanes) => [...prevArcanes, Object.values(arcaneList)[randomIndex]])
        setArcanes((prevArcanes) => [...prevArcanes, Object.keys(arcaneList)[randomIndex]])
        tempArcanes.push(Object.keys(arcaneList)[randomIndex])
      }
      set(arcaneRef, tempArcanes)
    }
  }, [])
  useEffect(() => {
    if (uniqueId && uniqueId !== hostId && arcanes?.length > 4) {
      for (let i = 0; i < arcanes.length; i++) {
        const color = Object.entries(arcaneList).find(([key, _value]) => key === arcanes[i])
        console.log(arcanes[i])
        console.log(color)
        if (color) setArcaneColors((prevArcanes) => [...prevArcanes, color[1]])
      }
    }
  }, [arcanes])
  useEffect(() => {
    if (round == 2) setArcaneType(arcanes[0])
    if (round == 6) setArcaneType(arcanes[1])
    if (round == 10) setArcaneType(arcanes[2])
    if (round == 14) setArcaneType(arcanes[3])
    if (round == 18) setArcaneType(arcanes[4])
  }, [round])
  return (
    <div id="fade-in" className="lg:mt-8 lg:mb-0  z-30 lg:static absolute top-2 ">
      <div className="relative">
        <svg className="" width="335" height="28" viewBox="0 0 335 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <svg width={round * 16.75} height={round > 1 ? '28' : '0'} viewBox={`0 0 ${round * 16.75} 20`} fill="#B8AFE0" xmlns="http://www.w3.org/2000/svg">
            <path d={`M${round * 16.75} 20H0V0H${round * 16.75}V20Z`} fill="#B8AFE0" />
          </svg>
          <path d="M332.406 26.1667H2.59375V1.83342H332.406V26.1667Z" stroke="#E1DAFF" strokeWidth="6" strokeMiterlimit="10" />
        </svg>
        <div className=" absolute top-[5px] left-6 gap-14 flex">
          {arcaneColors.map((color, index) => (
            <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg" key={index}>
              <path d="M0 8L5.5 16L11 8L5.5 4.04797e-07L0 8Z" fill={color} />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoundBar
