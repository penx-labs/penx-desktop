import { WorkerEvents } from '@penx/constants'
import { db } from '@penx/local-db'
import { updateExtension } from './updateExtension'

self.addEventListener('message', async (event) => {
  await db.database.connect()
  if (event.data === WorkerEvents.START_POLLING) {
    // startPollingPush()
    // startPollingPull()
  }

  updateExtension()
})
