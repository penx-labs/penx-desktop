import { renderList } from 'penx'

export function main() {
  renderList([
    {
      title: 'First Item',
      subtitle: 'This is the first item',
      actions: [
        {
          type: 'CopyToClipboard',
          content: 'First Item',
        },
      ],
    },
    {
      title: 'Second Item',
      subtitle: 'This is the second item',
      actions: [
        {
          type: 'CopyToClipboard',
          content: 'Second Item',
        },
      ],
    },
    {
      title: 'Third Item',
      subtitle: 'This is the third item',
      actions: [
        {
          type: 'CopyToClipboard',
          content: 'Third Item',
        },
      ],
    },
  ])
}
