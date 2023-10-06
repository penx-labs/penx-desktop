import { db } from '@penx/local-db'

type Manifest = {
  name: string
  id: string
  version: string
  main: string
  code: string
}

export async function updateExtension() {
  const eventSource = new EventSource('http://localhost:5001/extension-sse')

  eventSource.onmessage = async (event) => {
    const data = event.data
    const extension: Manifest = JSON.parse(data)
    console.log(
      '[Extension code updated, Please refresh page manually]:',
      extension,
    )

    const activeSpace = await db.getActiveSpace()
    if (activeSpace) {
      await db.installExtension({
        spaceId: activeSpace.id,
        code: extension.code,
        slug: extension.id,
        name: extension.name,
        version: extension.version,
      })
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
  }
}
