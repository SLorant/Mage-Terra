'use client'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Board from './Board'
import app from '../firebase/config'
import { getDatabase, ref, set, onValue } from 'firebase/database'

export default function Home() {
  function readData() {
    const db = getDatabase(app)
    const dataRef = ref(db, '/vmi')

    onValue(dataRef, (snapshot) => {
      const data = snapshot.val()
      // Handle the retrieved data
      console.log('Data:', data)
    })
  }

  function writeData() {
    const db = getDatabase(app)
    const dataRef = ref(db, '/vmi')

    set(dataRef, { key1: 'value1', key2: 'value2' })
      .then(() => {
        console.log('Data written successfully.')
      })
      .catch((error) => {
        console.error('Error writing data:', error)
      })
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <div className="bg-purple-300 h-full w-2/3 flex items-center justify-center gap-20">
        <button onClick={readData}>Read Data</button>
        <button onClick={writeData}>Write Data</button>

        <div className="items-center flex-col  justify-center">
          <div className="text-5xl mt-0 text-center"> The game</div>
          <div className="mt-20 w-[1100px] bg-blue-300 h-[640px] gap-0 shadow-md">
            <DndProvider backend={HTML5Backend}>
              <Board />
            </DndProvider>
          </div>
        </div>
      </div>
    </main>
  )
}
