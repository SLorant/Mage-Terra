'use client'

import Image from 'next/image'

export default function Home() {
  return (
    <main className={`flex h-full flex-col items-center justify-center text-white  font-sans`}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="h-full overflow-auto w-1/2 darkbg z-50 flex flex-col items-center justify-start">
        <h1 className="text-5xl mt-10">The rules of MageTerra</h1>

        <h1 className="text-3xl mt-10">Starting a game</h1>
        <div className="mt-10 w-full px-28 text-justify text-lg">
          <p>
            MageTerra can be played with 2-6 players either with friends, or randos. Only the host can start the game. Don't forget to click the "I'm ready"
            button before starting!
          </p>
        </div>
        <h1 className="text-3xl mt-10">How to place dominos?</h1>
        <div className="mt-10 w-full px-28 text-justify text-lg">
          <p>
            You choose (choosing explained below) one domino each round. You can only place it next to the same colored domino, you can rotate it beforehand.
          </p>
          <p>You gain points for each connected (space) per color. Earn the most points to win. Thats it! Pretty easy, right?</p>
          <p>There are three special square types:</p>
          <div className="flex">
            <p>Tower</p>
            <Image alt="tower" src={'dominoes/tower.webp'} className="rounded-md" height={100} width={100} unoptimized />
          </div>
          <div className="flex">
            <p>Special</p>
            <Image alt="tower" src={'dominoes/ruin-01.webp'} className="rounded-md" height={100} width={100} unoptimized />
          </div>
          <div className="flex">
            <p>Special</p>
            <Image alt="tower" src={'dominoes/star.svg'} className="rounded-md" height={100} width={100} unoptimized />
          </div>
        </div>
        <h1 className="text-3xl mt-10">Scoreboard</h1>
        <h1 className="text-3xl mt-10">Domino choosing</h1>
        <h1 className="text-3xl mt-10">More info</h1>
        <div className="mt-10 w-full px-28 text-justify text-lg">
          <p>
            MageTerra can be played with 2-6 players. You can either play with your friends in a private room, or play with random people. In both modes there
            is a host, who can start the game. If the host quits, a new host will be chosen randomly. Normal play rooms wait five minutes, if the game is not
            started by then, the room gets deleted. When you have chosen your name and avatar, press the "I'm ready" button, otherwise your choices won't get
            saved.
          </p>
        </div>
      </div>
    </main>
  )
}
