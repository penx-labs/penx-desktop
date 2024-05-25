import { ReactNode, useMemo } from 'react'
import { assert } from 'console'
import { Box, FowerHTMLProps } from '@fower/react'
import { IAccessory, IListItem, isAccessoryObjectText } from 'penx'
import { useCurrentCommand } from '~/hooks/useCurrentCommand'
import { StyledCommandItem } from './CommandComponents'
import { ListItemIcon } from './ListItemIcon'

interface ListItemUIProps extends Omit<FowerHTMLProps<'div'>, 'onSelect'> {
  index: number
  item: IListItem
  isListApp?: boolean
  titleLayout?: 'column' | 'row'
  onSelect?: (item: IListItem) => void
}

export const ListItemUI = ({
  item,
  onSelect,
  index,
  titleLayout = 'row',
  isListApp = false,
  ...rest
}: ListItemUIProps) => {
  const { currentCommand } = useCurrentCommand()

  const itemIcon = useMemo(() => {
    if (!isListApp) return item.icon
    const assets = currentCommand?.data?.assets || {}
    return assets[item.icon as string]
  }, [isListApp, item, currentCommand])

  const title = typeof item.title === 'string' ? item.title : item.title.value

  const subtitle =
    typeof item.subtitle === 'string' ? item.subtitle : item.subtitle?.value

  if (item.type === 'list-heading') {
    return (
      <Box textXS gray400 pl-10 mb-2 mt2={index > 0}>
        {title}
      </Box>
    )
  }

  return (
    <StyledCommandItem
      cursorPointer
      toCenterY
      toBetween
      px2
      py2
      gap4
      roundedLG
      black
      value={title}
      onSelect={() => {
        onSelect?.(item)
      }}
      onClick={() => {
        onSelect?.(item)
      }}
      {...rest}
    >
      <Box toCenterY gap2>
        <ListItemIcon icon={itemIcon as string} />
        <Box flexDirection={titleLayout} gapY1 toCenterY gapX2>
          <Box text-14>{title}</Box>
          <Box text-12 zinc400>
            {subtitle}
          </Box>
        </Box>
      </Box>
      {!!item.data?.commandName && (
        <Box textXS gray400>
          Command
        </Box>
      )}
      {item?.extra && (
        <Box toCenterY gap2 textXS gray600>
          {item.extra.map((extra, index) => (
            <Accessory key={index} item={extra} />
          ))}
        </Box>
      )}
    </StyledCommandItem>
  )
}

interface AccessoryProps {
  item: IAccessory
}
function Accessory({ item }: AccessoryProps) {
  const { currentCommand } = useCurrentCommand()
  const assets = currentCommand?.data?.assets || {}

  let text: ReactNode = useMemo(() => {
    if (typeof item.text === 'string' || typeof item.text === 'number') {
      return <Box>{item.text}</Box>
    }
    if (isAccessoryObjectText(item.text)) {
      return (
        <Box color={item.text.color || 'gray600'}>{item.text?.value || ''}</Box>
      )
    }
    return null
  }, [item.text])
  let tag: ReactNode = item.tag ? (
    <Box bgAmber500 white h-24 rounded px2 toCenterY>
      {item.tag.value}
    </Box>
  ) : null

  let icon: ReactNode = item.icon ? (
    <ListItemIcon roundedFull icon={assets[item.icon]} />
  ) : null

  return (
    <Box toCenterY gap1>
      {icon}
      {text}
      {tag}
    </Box>
  )
}