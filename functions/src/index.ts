import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { DataSnapshot } from 'firebase-admin/database'

admin.initializeApp()

exports.monitorNodes = functions.database.ref('/updates').onWrite(async (change) => {
  const updateNodeRef = change.after.ref
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
  // Retrieve all child nodes within the parent node
  const snapshot = await updateNodeRef?.once('value')
  if (snapshot) {
    snapshot.forEach((childSnapshot) => {
      const timestamp = childSnapshot.val()
      // Check if the node hasn't been modified in the last 30 minutes
      if (timestamp < thirtyMinutesAgo) {
        // Node deletion after 30 minutes
        deleteNode(childSnapshot)
      }
    })
  }
  async function deleteNode(childSnapshot: DataSnapshot) {
    //Delete the room itself, and the update node too
    const projectRef = admin.database().ref('/')
    await projectRef?.child(childSnapshot.key ?? '').remove()
    await updateNodeRef?.child(childSnapshot.key ?? '').remove()
  }
})
