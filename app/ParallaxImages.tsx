import React from 'react'
import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import dominoes from './animations/dominos.json'
import mage2 from './animations/mage2.json'
const ParallaxImages = () => {
  function useParallaxEffect(values: any) {
    useEffect(() => {
      function parallax(event: any) {
        document.querySelectorAll('.parallax').forEach((shift: any, index) => {
          const { x: shiftX, y: shiftY } = values[index]
          const x = (window.innerWidth - event.pageX * shiftX) / 90
          const y = (window.innerHeight - event.pageY * shiftY) / 90
          shift.style.transform = `translateX(${x}px) translateY(${y}px)`
        })
      }

      document.addEventListener('mousemove', parallax)
      // Cleanup listener to prevent memory leaks
      return () => {
        document.removeEventListener('mousemove', parallax)
      }
    }, [values])
  }

  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const lottieRef2 = useRef<LottieRefCurrentProps>(null)
  useParallaxEffect([
    { x: 2, y: -4 },
    { x: -2, y: 4 },
  ])
  return (
    <div>
      <div className="w-[820px] h-[1150px] sm:w-[1000px] sm:h-[1400px] absolute md:-top-16 top-72 sm:top-40 -left-36 sm:-left-24 lg:left-0 xl:left-14 2xl:left-20 z-10 sm:z-0 parallax left">
        <Image className="" height={1000} width={1000} src="/homemage.png" alt="mage"></Image>
        <Lottie className=" absolute top-0 left-0" animationData={dominoes} lottieRef={lottieRef} />
      </div>
      <div className="w-[700px] h-[1200px]  sm:w-[850px] sm:h-[1400px] absolute -top-24 -right-40 sm:-top-20 sm:-right-40 lg:-right-4 xl:right-20 2xl:right-20 z-0 parallax right">
        <Image className="" height={850} width={850} src="/homemage2.png" alt="mage"></Image>
        <Lottie className=" absolute top-4 sm:top-0 right-0" animationData={mage2} lottieRef={lottieRef2} />
      </div>
    </div>
  )
}

export default ParallaxImages
