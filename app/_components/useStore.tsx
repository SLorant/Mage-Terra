import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

type State = {
  uniqueId: string
}
type Action = {
  initializeUniqueId: () => void
  updateUniqueId: (uniqueId: string) => void
}
type playerState = {
  playerCount: number
}

type playerAction = {
  updatePlayerCount: (playerCount: number) => void
}

export const useStore = create<State & Action>((set) => ({
  uniqueId: '',
  initializeUniqueId: () => {
    let storedUniqueId = localStorage.getItem('uniqueId')
    if (storedUniqueId) {
      set({ uniqueId: storedUniqueId })
    } else {
      const newUniqueId = uuidv4()
      set({ uniqueId: newUniqueId })
      localStorage.setItem('uniqueId', newUniqueId)
    }
  },
  updateUniqueId: (uniqueId) => set(() => ({ uniqueId: uniqueId })),
}))

export const usePlayerStore = create<playerState & playerAction>((set) => ({
  playerCount: 0,
  updatePlayerCount: (count) => set(() => ({ playerCount: count })),
}))
