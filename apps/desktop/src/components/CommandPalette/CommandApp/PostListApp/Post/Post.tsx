'use client'

import { useEffect, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { IPost } from '@/common/types'
import { PlateEditor } from '@/components/editor/plate-editor'
import { editorDefaultValue } from '@/lib/constants'
import { useDebouncedCallback } from 'use-debounce'
import { trpc } from '@penx/trpc-client'
// import { ProfileAvatar } from '../Profile/ProfileAvatar'
import { CoverUpload } from './CoverUpload'

export function Post({ post }: { post: IPost }) {
  const [data, setData] = useState<IPost>(post)
  const { mutateAsync } = trpc.post.update.useMutation()
  // const { setPostSaving } = usePostSaving()

  const debounced = useDebouncedCallback(
    async (value: IPost) => {
      if (data.content !== post.content || data.title !== post.title) {
        // setPostSaving(true)

        try {
          await mutateAsync({
            id: data.id,
            title: value.title,
            content: value.content,
            description: value.description,
          })
        } catch (error) {}
        // setPostSaving(false)
      }
    },
    // delay in ms
    400,
  )

  useEffect(() => {
    debounced(data)
  }, [data, debounced])

  return (
    <div className="w-full h-full">
      <div className="relative min-h-[500px] max-w-screen-lg p-12 px-8 mx-auto z-0">
        <div className="mb-5 flex flex-col space-y-3 ">
          <CoverUpload post={data} />
          <TextareaAutosize
            placeholder="Title"
            defaultValue={data?.title || ''}
            autoFocus
            onChange={(e) => {
              setData({ ...data, title: e.target.value })
            }}
            className="dark:placeholder-text-600 w-full resize-none border-none px-0 placeholder:text-foreground/40 focus:outline-none focus:ring-0 bg-transparent text-4xl font-bold"
          />
          <TextareaAutosize
            placeholder="Description"
            defaultValue={post?.description || ''}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="dark:placeholder-text-600 w-full resize-none border-none px-0 placeholder:text-stone-400 focus:outline-none focus:ring-0 bg-transparent"
          />
        </div>
        <div className="mb-4 space-y-2">
          {/* <ProfileAvatar showName /> */}
          {/* <Tags /> */}
        </div>

        <PlateEditor
          className="w-full -mx-6"
          value={post.content ? JSON.parse(post.content) : editorDefaultValue}
          showAddButton
          onChange={(v) => {
            setData({ ...data, content: JSON.stringify(v) })
          }}
        />
      </div>
    </div>
  )
}