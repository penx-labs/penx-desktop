import { useState } from 'react'
import { Box } from '@fower/react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from 'uikit'
import { RouterOutputs } from '@penx/api'
import { BASE_URL } from '@penx/constants'
import { db } from '@penx/local-db'
import { trpc } from '@penx/trpc-client'
import { IExtensionItem } from '~/common/types'
import { useCommandPosition } from '~/hooks/useCommandPosition'
import { StyledCommandGroup } from '../../CommandComponents'
import { ExtensionDetail } from './ExtensionDetail'
import { ExtensionItem } from './ExtensionItem'

export function PostListApp() {
  const { data = [], isLoading } = trpc.extension.all.useQuery()
  const { data: extensions = [] } = useQuery({
    queryKey: ['extension', 'installed'],
    queryFn: () => db.listExtensions(),
  })

  const { isCommandAppDetail, setPosition } = useCommandPosition()
  const [extension, setExtension] = useState<IExtensionItem>(null as any)

  if (isLoading)
    return (
      <Box column gap1>
        <Skeleton h-64 />
        <Skeleton h-64 />
        <Skeleton h-64 />
      </Box>
    )

  return (
    <StyledCommandGroup>
      {isCommandAppDetail && (
        <ExtensionDetail item={extension} extensions={extensions} />
      )}
      {!isCommandAppDetail &&
        data?.map((item) => {
          return (
            <ExtensionItem
              key={item.id}
              item={item}
              extensions={extensions}
              onSelect={() => {
                setExtension(item)
                setPosition('COMMAND_APP_DETAIL')
              }}
            />
          )
        })}
    </StyledCommandGroup>
  )
}