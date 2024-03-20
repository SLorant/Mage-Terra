'use client'

import ParallaxImages from '@/app/_components/ParallaxImages'
import { BackButton } from '@/app/_components/Vectors'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const handleGoBack = () => {
    router.push(`/`)
  }

  return (
    <main className={`flex h-full flex-col items-center justify-center text-white  font-sans`}>
      <div className="mainbg w-full h-full absolute top-0 left-0 z-20"></div>
      <div className="md:block hidden">
        <ParallaxImages />
      </div>
      <div className="h-full relative overflow-auto w-full px-8 md:px-16 xl:px-28 md:w-2/3 2xl:w-1/2 darkbg z-50 flex flex-col items-center justify-start">
        <button className="z-30 absolute top-6 left-10" onClick={handleGoBack}>
          <BackButton />
        </button>
        <h1 className="text-5xl mt-10">The rules of Mage Terra</h1>
        <div className="mt-10 w-full  text-justify text-lg">
          <p>Mage Terra is a turn based game, the main goal is to place the same coloured dominoes together to score more points than your opponent(s).</p>
        </div>
        <h1 className="text-3xl mt-10">Starting a game</h1>
        <div className="mt-10 w-full  text-justify text-lg">
          <p>
            Mage Terra can be played with 2-6 players either with friends, or randos. Choose a name and avatar, then click the "I'm ready!" button to save them.
            Only the host can start the game.
          </p>
        </div>
        <h1 className="text-3xl mt-10">How to place dominos?</h1>
        <div className="mt-10 w-full  text-justify text-lg">
          <p>You choose one domino each round. You can only place it next to the same colored domino and you can rotate it beforehand.</p>
          <p>You gain points for the biggest connected area per color. Earn the most points to win. Thats it! Pretty easy, right?</p>
          <p className="mt-2">Here is an example:</p>
          <div className="flex  items-center gap-4 my-2">
            <Image alt="example" src={'examples/domexample.png'} className="rounded-md" height={400} width={400} unoptimized />
            <p className="mb-4">As you see, there are five connected green squares here. So, this green area counts as 5 points.</p>
          </div>
          <p>There are three special square types:</p>
          <div className="flex  items-center gap-4 my-2">
            <Image alt="tower" src={'dominoes/tower.webp'} className="rounded-md" height={100} width={100} unoptimized />
            <p>Tower. The Mage Tower is your starting point. Any colored domino can be connected to the Tower square. </p>
          </div>
          <div className="flex  items-center gap-4 my-2">
            <Image alt="tower" src={'dominoes/ruin-01.webp'} className="rounded-md" height={100} width={100} unoptimized />
            <p>Ruin. Ruins are like holes in the board - they don't count as points, and you can't connect anything to them.</p>
          </div>
          <div className="flex  items-center gap-4 my-2">
            <Image alt="tower" src={'dominoes/star.svg'} className="rounded-md w-[100px] h-[100px]" height={200} width={200} unoptimized />
            <p>
              Star. Stars are important: they double your points for that color block which they are in! Also, no matter its size, an area with a star in it
              always counts for points. Here's an example for stars:
            </p>
          </div>
          <div className="flex  items-center gap-4 my-2">
            <Image alt="example" src={'examples/starexample.png'} className="rounded-md" height={200} width={200} unoptimized />
            <p className="mb-4">There are four connected pink squares, and one star within. This means that the player gets 4*2=8 points for this pink area.</p>
          </div>
        </div>
        <h1 className="text-3xl mt-10">Scores & Scoreboard </h1>
        <div className="mt-10 w-full  text-justify text-lg">
          <p>
            You gain 1 point per square from the largest area of every color. If you have stars in your realm, your areas with stars get counted too. If your
            biggest area contains a star, it only gets counted once. In case of equal areas, one with star: only the starred area earn points.
          </p>
          <p className="mt-6">
            Below the scoreboard you can switch through every players' current map, so you can check how mighty their realms are truly. In the domino choosing
            phase, the points on the scoreboard are replaced with the players' arcanes (see below).
          </p>
        </div>
        <h1 className="text-3xl mt-10">Domino choosing</h1>
        <div className="mt-10 w-full  text-justify text-lg">
          <p>At the beginning of a round, every player chooses a domino in turns. The order of selecting is calculated with arcanes.</p>

          <p>The arcane indicates how many squares you have of the current color.</p>
          <Image alt="example" src={'examples/arcanexample.png'} className="rounded-md mt-4 mb-2" height={220} width={220} unoptimized />
          <p>So for example if your entire board has 4 blue squares, and village (blue) is the current arcane, you have 4 arcanes!</p>
          <Image alt="example" src={'examples/roundbarexample.png'} className="rounded-md mt-4 mb-2" height={300} width={300} unoptimized />
          <p>On the roundbar, you can see the next arcanes. They change every two rounds, and they are random, you can get the same arcanes in a game.</p>
        </div>
        <h1 className="text-3xl mt-10">More info</h1>
        <div className="mt-10 w-full  text-justify text-lg ">
          <p>
            In both game modes, if the host quits, a new host will be chosen randomly. Normal play rooms wait five minutes, if the game is not started by then,
            the room gets deleted.
          </p>
        </div>
        <div className="mt-10 flex flex-col w-full justify-center items-center text-justify text-lg mb-12">
          <p className="text-2xl">Have fun, and thank you for playing the game!</p>
          <Image className="w-96 mt-4" src="/examples/avatars.png" alt="avatars" height={80} width={80} unoptimized></Image>
        </div>
      </div>
    </main>
  )
}
