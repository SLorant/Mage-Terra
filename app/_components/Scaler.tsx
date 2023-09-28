import { useMediaQuery } from 'react-responsive'
export const Scaler = () => {
  const isNotPhone = useMediaQuery({ query: '(min-width: 768px)' })
  if (isNotPhone) {
    let container = document.getElementById('gameContainer')
    const minScale = 0.1
    const maxScale = 1
    let scale = Math.min(window.innerWidth / (container?.offsetWidth ?? 0 + 8), window.innerHeight / (container?.offsetHeight ?? 0 + 8))
    scale = Math.min(maxScale, Math.max(minScale, scale))
    document.documentElement.style.setProperty('--trickyScale', scale.toString())
    window.onresize = function () {
      let container = document.getElementById('gameContainer')
      const minScale = 0.1
      const maxScale = 1
      let scale = Math.min(window.innerWidth / (container?.offsetWidth ?? 0 + 8), window.innerHeight / (container?.offsetHeight ?? 0 + 8))
      scale = Math.min(maxScale, Math.max(minScale, scale))
      document.documentElement.style.setProperty('--trickyScale', scale.toString())
    }
  }
}
