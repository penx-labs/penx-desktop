import { invoke } from '@tauri-apps/api/tauri'
import { EventType, IListItem } from 'penx'
import clipboard from 'tauri-plugin-clipboard-api'
import { db } from '@penx/local-db'
import { sleep } from '@penx/shared'
import { workerStore } from '~/common/workerStore'
import { useCommandAppLoading } from './useCommandAppLoading'
import { useCommandAppUI } from './useCommandAppUI'
import { useCommandPosition } from './useCommandPosition'
import { useCurrentCommand } from './useCurrentCommand'

export function useHandleSelect() {
  const { setUI } = useCommandAppUI()
  const { setPosition } = useCommandPosition()
  const { setCurrentCommand } = useCurrentCommand()
  const { setLoading } = useCommandAppLoading()

  return async (item: IListItem, input = '') => {
    const { appWindow, WebviewWindow } = await import('@tauri-apps/api/window')

    if (item.type === 'command') {
      // if (!q) setQ(item.title as string)

      setLoading(true)
      setCurrentCommand(item)

      setPosition('COMMAND_APP')

      const ext = await db.getExtensionBySlug(item.data.extensionSlug)
      if (!ext) return

      const command = ext.commands.find(
        (c) => c.name === item.data.commandName,
      )!

      if (command.runtime === 'iframe') {
        const $iframe = document.getElementById('command-app-iframe')!
        if (!$iframe) return
        const currentWindow = ($iframe as any).contentWindow as Window

        currentWindow.document.body.innerHTML = '<div id="root">Hello</div>'
        ;(currentWindow as any).eval(command.code)

        return
      }

      let worker: Worker
      if (command.isBuiltIn) {
        // console.log('name........:', command)

        if (command.name === 'clipboard-history') {
          worker = new Worker(
            new URL('../workers/clipboard-history.ts', import.meta.url),
            { type: 'module' },
          )
        } else {
          worker = new Worker(
            new URL('../workers/marketplace.ts', import.meta.url),
            { type: 'module' },
          )
        }
      } else {
        // console.log('=========command?.code:, ', command?.code)

        const extraCode = `
          self.onmessage = (event) => {
            if (event.data === 'BACK_TO_ROOT') {
              self.close()
            }
          }
          self.input = '${input}';
        `

        let blob = new Blob([command?.code + extraCode], {
          type: 'application/javascript',
        })
        const url = URL.createObjectURL(blob)
        worker = new Worker(url)
        // await sleep(2000)
      }
      setLoading(false)

      workerStore.currentWorker = worker

      // worker.terminate()

      item.data.commandName && worker.postMessage(item.data.commandName)

      worker.onmessage = async (event: MessageEvent<any>) => {
        if (event.data.type === EventType.RunAppScript) {
          const result = await invoke('run_applescript', {
            script: event.data.script,
            human_readable_output: true,
          })

          event.ports[0].postMessage({
            type: EventType.RunAppScriptResult,
            result,
          })
        }

        if (event.data?.type === EventType.RenderList) {
          const list: IListItem[] = event.data.items || []
          console.log('event--------:', event.data.items)

          const newItems = list.map<IListItem>((item) => ({
            type: 'list-item',
            ...item,
          }))

          setUI({
            type: 'list',
            items: newItems,
          })
        }

        if (event.data?.type === EventType.RenderMarkdown) {
          const content = event.data.content as string
          setUI({
            type: 'markdown',
            content,
          })
        }

        if (event.data?.type === EventType.Loading) {
          const content = event.data.content as any
          setUI({
            type: 'loading',
            data: content,
          })
        }

        if (event.data?.type === 'marketplace') {
          setUI({ type: 'marketplace' })
        }

        if (event.data?.type === EventType.Render) {
          const component = event.data.component as any
          setUI({
            type: 'render',
            component,
          })
        }
      }
    }

    if (item.type === 'list-item') {
      if (item.actions?.[0]) {
        const defaultAction = item.actions?.[0]
        if (defaultAction.type === 'OpenInBrowser') {
          // console.log('========defaultAction.url:', defaultAction.url)
          open(defaultAction.url)
        }

        if (defaultAction.type === 'CopyToClipboard') {
          await clipboard.writeText(defaultAction.content)
        }
      }
      console.log('list item:', item)
    }
  }
}
