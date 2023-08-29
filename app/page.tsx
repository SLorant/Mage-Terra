'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ref, set } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import { projectDatabase } from '@/firebase/config'
import { Amaranth } from 'next/font/google'
import Image from 'next/image'
import { useStore } from './useStore'
import ParallaxImages from './ParallaxImages'

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

  return (
    <main className={`flex h-full mt-6 sm:mt-2 flex-col items-center justify-center text-white ${amaranth.variable} font-sans`}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="mb-10 sm:mb-4  z-30  ">
        <Image className="w-[90vw] md:w-[50vh] md:h-[22vh]" height={500} width={500} src="/logo.png" alt="logo"></Image>
      </div>
      <ParallaxImages />
      <div className="z-30  text-xl mb-10 rounded-lg w-1/2 lg:w-1/3 flex flex-col items-center justify-center">
        <p className="mb-16 text-2xl text-center hidden md:block">
          Join the party and create the <br /> most powerful magical kingdom
        </p>
        <button className="darkbg w-[80vw] sm:w-[500px] rounded-sm h-14 mb-6 text-2xl  text-white " disabled onClick={handlePlayGame}>
          play
        </button>
        <button
          className="darkbg hover:scale-105 transition duration-500 ease-in-out w-[80vw] sm:w-[500px] rounded-sm h-14 text-2xl  text-white"
          onClick={handlePlayGame}>
          create private room
        </button>

        <p className="text-xl mt-10 mb-2 opacity-60 sm:opacity-40">New to the game?</p>
        <button className="darkbg mb-20  w-[80vw] sm:w-[500px] h-14 rounded-sm  text-2xl  text-white" disabled>
          play the tutorial
        </button>
      </div>
      <div
        className="w-3/4 sm:ml-20 absolute bottom-6 sm:bottom-2
       sm:flex-row flex-col text-xl justify-center items-center opacity-40 h-20 z-30 flex sm:gap-20 text-white">
        <a className="mb-2">Cookies</a>
        <Image className="hidden sm:inline" height={100} width={100} alt="simplelogo" src="/logosimple.png"></Image>
        <a className="mb-2">Terms & conditions</a>
      </div>
    </main>
  )
}
