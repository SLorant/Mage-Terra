'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ref, set } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import { projectDatabase } from '@/firebase/config'
import { Amaranth } from 'next/font/google'
import Image from 'next/image'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import floatingdominoes from './animations/floatingdominos.json'
import useStore from './IdStore'

const amaranth = Amaranth({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-amaranth',
})

export default function Home() {
  const router = useRouter()
  //const [uniqueId, setUniqueId] = useState('')
  const [roomId, setRoomId] = useState('')
  const { uniqueId, initializeUniqueId } = useStore()

  useEffect(() => {
    if (uniqueId === '') {
      initializeUniqueId()
    }
    if (roomId === '') {
      const newUniqueId = uuidv4()
      setRoomId(newUniqueId)
    }
  }, [])

  const handlePlayGame = async () => {
    try {
      const dataRef = ref(projectDatabase, `/${roomId}/${uniqueId}/Name`)
      await set(dataRef, 'New player')
      const avatarRef = ref(projectDatabase, `/${roomId}/${uniqueId}/Avatar`)
      await set(avatarRef, 1)
      router.push(`/room?roomId=${roomId}`)
    } catch (error) {
      console.log('Error setting the data: ' + error)
    }
  }

  const lottieRef = useRef<LottieRefCurrentProps>(null)
  return (
    <main className={`flex h-screen flex-col items-center justify-center text-white ${amaranth.variable} font-sans`}>
      <div className="mb-10">
        <h1 className="text-6xl">LOGO</h1>
      </div>
      <div className="absolute top-0 left-0 z-0">
        <Image className="ml-20" height={500} width={500} src="/homemage.png" alt="asd"></Image>
        <Lottie className="w-[100px] h-[100px] absolute top-0 left-0" animationData={floatingdominoes} lottieRef={lottieRef} />
      </div>
      <div className="bg-[#170e2ea3] text-xl mb-20 rounded-lg h-1/2 w-1/2 flex flex-col items-center justify-center">
        <p className="mb-20">Random bevezető mondat lorem ipsum izébizé</p>
        <div className="gap-20 flex items-center justify-center">
          <button className="px-24 rounded-md py-6 text-2xl bg-[#CFCEFB] text-black opacity-50" disabled onClick={handlePlayGame}>
            Play!
          </button>
          <button className="px-12 rounded-md py-6 text-2xl bg-[#CFCEFB] text-black" onClick={handlePlayGame}>
            Create private room
          </button>
        </div>

        <p className="text-xl mt-20 mb-2">New to the game?</p>
        <button className="px-12 rounded-md py-6 text-xl bg-[#CFCEFB] text-black opacity-50" disabled>
          Play the tutorial
        </button>
      </div>
    </main>
  )
}
