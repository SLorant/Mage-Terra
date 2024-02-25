import React from 'react'
import { set, ref, onValue, onDisconnect } from 'firebase/database'
import { useEffect, useState } from 'react'
import { projectDatabase } from '@/firebase/config'
import Image from 'next/image'
import { PrevAvatar, NextAvatar } from '@/app/_components/Vectors'
import { AvatarChooserProps } from '@/app/_components/Interfaces'
import { usePlayerStore } from '@/app/_components/useStore'

const AvatarChooser = ({
  uniqueId,
  isSpectator,
  setIsSpectator,
  playerName,
  setPlayerName,
  error,
  setError,
  room,
  currentPlayers,
  readNames,
  wentBack,
}: AvatarChooserProps) => {
  const [_, updatePlayerCount] = usePlayerStore((state) => [state.playerCount, state.updatePlayerCount])
  const [inputName, setInputName] = useState('')
  const [avatar, setAvatar] = useState(1)
  const [isClickedPrev, setIsClickedPrev] = useState(false)
  const [isClickedNext, setIsClickedNext] = useState(false)
  useEffect(() => {
    const randomAvatar = Math.floor(Math.random() * 12)
    if (randomAvatar > 0) setAvatar(randomAvatar)
  }, [])

  useEffect(() => {
    if (uniqueId && wentBack === false) {
      const playerRef = ref(projectDatabase, `/${room}/${uniqueId}`)
      const playerDisconnectRef = onDisconnect(playerRef)
      playerDisconnectRef.remove()
      updatePlayerCount(currentPlayers)
      const gameStartedRef = ref(projectDatabase, `/${room}/gameStarted`)
      let gameStarted: boolean = false
      onValue(gameStartedRef, (snapshot) => {
        const data = snapshot.val()
        if (data === true) gameStarted = true
      })
      if (currentPlayers !== 100 && currentPlayers < 6 && !gameStarted) {
        if (playerName === 'New player') {
          const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
          set(dataRef, 'New player')
          const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
          set(avatarRef, avatar)
        }
        setIsSpectator(false)
      } else if (Object.keys(readNames).includes(uniqueId)) {
        setIsSpectator(false)
      } else if (currentPlayers !== 100) {
        setIsSpectator(true)
      }
    }
  }, [uniqueId, currentPlayers])
  const handleConfirmName = () => {
    if (inputName.length === 0) setError('Your name must contain characters')
    else if (inputName.length > 10) setError('Your name can be max 10 characters')
    else {
      const dataRef = ref(projectDatabase, `/${room}/${uniqueId}/Name`)
      set(dataRef, inputName)
      const avatarRef = ref(projectDatabase, `/${room}/${uniqueId}/Avatar`)
      set(avatarRef, avatar)
      setPlayerName(inputName)
      setInputName('')
      setError('')
    }
  }
  const handleNextAv = () => {
    setIsClickedNext(true)
    setTimeout(() => {
      setIsClickedNext(false)
    }, 300)
    if (avatar > 11) {
      setAvatar(1)
    } else setAvatar(avatar + 1)
  }
  const handlePrevAv = () => {
    setIsClickedPrev(true)
    setTimeout(() => {
      setIsClickedPrev(false)
    }, 300)
    if (avatar < 2) {
      setAvatar(12)
    } else setAvatar(avatar - 1)
  }

  const currentAvatar = `avatar-${avatar}.png`
  return (
    <div id="fade-in" className="flex flex-col  items-center justify-center avatarchooser">
      <div className="flex justify-center items-center  text-3xl">
        <button
          className={`prev mt-4 ${isClickedPrev ? '-translate-x-0.5 transition duration-200 ease-in-out' : 'transition duration-200 ease-in-out'}`}
          onClick={handlePrevAv}>
          <PrevAvatar />
        </button>
        <Image src={currentAvatar} alt="mainavatar" width={100} height={100} className="w-36 h-40 mainavatar" unoptimized />

        <button
          className={`next mt-4 ${isClickedNext ? 'translate-x-0.5 transition duration-200 ease-in-out' : 'transition duration-200 ease-in-out'}`}
          onClick={handleNextAv}>
          <NextAvatar />
        </button>
      </div>
      <div id="fade-in" className="flex flex-col relative items-center justify-center">
        <div className="mt-4">
          <input
            className="text-lg md:text-xl w-[200px] h-[40px] px-2"
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Your name"
          />
          <button
            className={`${isSpectator && 'opacity-50'} h-[40px] w-[100px] md:w-[120px] roombutton bg-lightpurple text-[#130242]
                transition ease-in-out duration-200 hover:bg-grey`}
            onClick={handleConfirmName}
            disabled={isSpectator ? true : false}>
            <p className="text-lg md:text-xl">I'm ready</p>
          </button>
        </div>
        {error && <p className="text-lightpurple text-lg lg:text-xl  absolute -bottom-8">{error}</p>}
      </div>
    </div>
  )
}
export default AvatarChooser
