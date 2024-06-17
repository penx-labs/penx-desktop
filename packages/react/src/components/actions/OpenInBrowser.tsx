import { ReactNode } from 'react'
import { BaseActionProps } from '../../types'
import { ListActionItem } from './ListActionItem'

interface OpenInBrowserProps extends BaseActionProps {
  url: string
  title?: ReactNode
}
export function OpenInBrowser({
  url,
  title = 'Open in Browser',
  shortcut,
  icon = {
    name: 'lucide--globe',
  },
}: OpenInBrowserProps) {
  return (
    <ListActionItem shortcut={shortcut} icon={icon}>
      {title}
    </ListActionItem>
  )
}