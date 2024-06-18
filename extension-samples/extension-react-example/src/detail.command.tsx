import { ActionPanel, ListApp, ListItem, Action } from '@penx/react'
import { clipboard, dialog, fs } from 'penx'
import { useEffect } from 'react'

export function Main() {
  useEffect(() => {
    ;(async () => {
      // console.log(
      //   await fs.readTextFile('/Users/hacker/Desktop/penx/package.json'),
      // )
      // console.log(await fs.readFile('/Users/hacker/Desktop/penx/package.json'))
      // console.log(await fs.stat('/Users/hacker/Desktop/penx/package.json'))
      // console.log(await fs.lstat('/Users/hacker/Desktop/penx/package.json'))
      // fs.truncate('/Users/hacker/Desktop/q.txt', 1)
      console.log(await fs.readDir('/Users/hacker/Desktop'))

      // console.log(await fs.exists('/Users/hacker/Desktop/penx/package.json'))
      // await fs.create('/Users/hacker/Desktop/a.txt')
      // fs.writeTextFile('/Users/hacker/Desktop/b.txt', 'Hello from huakun')
      // fs.copyFile('/Users/hacker/Desktop/b.txt', '/Users/hacker/Desktop/c.txt')
      // fs.remove('/Users/hacker/Desktop/c.txt')
      // fs.rename('/Users/hacker/Desktop/a.txt', '/Users/hacker/Desktop/q.txt')

      // fs.rename('/Users/hacker/Desktop/b.txt', '/Users/hacker/Desktop/d.txt')
      // await clipboard.writeText('Hello from huakun')
      // const cbText = await clipboard.readText()
      // console.log('Clipboard text:', cbText)
    })()
  }, [])
  const list = [
    'Foo',
    'Foo',
    'Foo',
    'Bar',
    'Hello world',
    'Name1',
    'Bar',
    'Hello world',
    'Name1',
    'Bar',
    'Hello world',
    'Name1',
    'Foo',
    'Bar',
    'Hello world',
    'Name1',
    'Foo',
    'Bar',
    'Hello world',
    'Name1',

    'Foo',
    'Bar',
    'Hello world',
    'Name1',
  ]

  return (
    <ListApp>
      {list.map((item, index) => (
        <ListItem
          key={index}
          title={item + index}
          subtitle={100 + index}
          icon={{
            name: 'tabler--brand-mysql',
            className: 'text-white bg-gradient-to-tl from-cyan-500 to-blue-500',
          }}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                content="Hello"
                // icon={{
                //   name: 'mdi--home',
                // }}
                shortcut={{
                  modifiers: ['cmd'],
                  key: 'enter',
                }}
              />
              <Action.OpenInBrowser
                url="https://iconify.design/docs/usage/css/tailwind/iconify/"
                shortcut={{
                  modifiers: ['cmd', 'shift'],
                  key: 'enter',
                }}
              />
            </ActionPanel>
          }
        />
      ))}
    </ListApp>
  )
}
