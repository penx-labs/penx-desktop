import { memo, useEffect } from 'react'
import { Separator } from '@/components/ui/separator'
import { useSearch } from '@/hooks/useSearch'
import { useValue } from '@/hooks/useValue'
import { Box } from '@fower/react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { open } from '@tauri-apps/plugin-shell'
import { ListJSON } from 'penx'
import clipboard from 'tauri-plugin-clipboard-api'
import { StyledCommandGroup } from '../CommandComponents'
import { ListItemUI } from '../ListItemUI'
import { DataListItem } from './DataListItem'

interface ListAppProps {
  component: ListJSON
}

export const ListApp = memo(function ListApp({ component }: ListAppProps) {
  const { value, setValue } = useValue()
  const { items, isShowingDetail, filtering, titleLayout } = component

  const currentItem = items.find((item) => item.title === value)!
  const dataList = currentItem?.detail?.items || []
  const { search } = useSearch()

  const filteredItems = !filtering
    ? items
    : items.filter((item) => {
        return item.title
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase())
      })
  useEffect(() => {
    const find = component.items.find((item) => item.title === value)
    if (!find) {
      const firstItem = component.items.find((item) => !item.type)
      firstItem && setValue(firstItem.title as string)
    }
  }, [component, value, setValue])

  const listJSX = (
    <StyledCommandGroup flex-2>
      {filteredItems.sort().map((item, index) => {
        return (
          <ListItemUI
            // key={index}
            key={item.title.toString()}
            index={index}
            titleLayout={titleLayout}
            isListApp={true}
            item={item as any} // TODO: handle any
            onSelect={async () => {
              if (item.actions?.[0]) {
                const defaultAction = item.actions?.[0]
                if (defaultAction.type === 'OpenInBrowser') {
                  open(defaultAction.url)
                  const appWindow = getCurrentWindow()
                  appWindow.hide()
                }
                if (defaultAction.type === 'CopyToClipboard') {
                  await clipboard.writeText(defaultAction.content)
                }
              }
              console.log('list item:', item)
            }}
          />
        )
      })}
    </StyledCommandGroup>
  )

  if (!isShowingDetail) {
    return listJSX
  }
  return (
    <Box toLeft overflowHidden absolute top0 bottom0 left0 right0>
      {listJSX}
      {isShowingDetail && (
        <>
          <Separator className="h-full" />
          <Box className="command-app-list-detail" flex-3 overflowAuto p3>
            <Box text2XL fontBold mb2>
              Detail
            </Box>
            <Box column gap1>
              {dataList.map((item) => (
                <DataListItem key={item.label} item={item} />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
})
