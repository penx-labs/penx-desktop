'use client'

import {
  // withTriggerCombobox,
  type TriggerComboboxPluginOptions,
} from '@udecode/plate-combobox'
import {
  createSlatePlugin,
  insertNodes,
  setNodes,
  type PluginConfig,
} from '@udecode/plate-common'
import { findNodePath } from '@udecode/plate-common/react'
import { Editor, Transforms } from 'slate'
import { api } from '@penx/trpc-client'
import type { TTagElement } from './types'
import { withTriggerCombobox } from './withTriggerCombobox'

export type TagConfig = PluginConfig<
  'tag',
  {
    insertSpaceAfterMention?: boolean
  } & TriggerComboboxPluginOptions,
  {},
  {
    insert: {
      tag: (options: {
        search: string
        value: any
        key?: any
        color: string
        databaseId: string
        siteId: string
        element: any
      }) => void
    }
  }
>

export const BaseTagInputPlugin = createSlatePlugin({
  key: 'tag_input',
  node: { isElement: true, isInline: true, isVoid: true },
})

/** Enables support for autocompleting @mentions. */
export const BaseTagPlugin = createSlatePlugin({
  key: 'tag',
  extendEditor: withTriggerCombobox,
  node: { isElement: true, isInline: true, isMarkableVoid: true, isVoid: true },
  options: {
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: BaseTagInputPlugin.key,
    }),
    trigger: '#',
    triggerPreviousCharPattern: /.*?/,
  },
  plugins: [BaseTagInputPlugin],
}).extendEditorTransforms<TagConfig['transforms']>(({ editor, type }) => ({
  insert: {
    tag: async ({ key, value, color, databaseId, siteId, element }) => {
      console.log('========siteId>>>>::', siteId)

      insertNodes<TTagElement>(editor, {
        key,
        children: [{ text: '' }],
        type,
        value,
        color,
        siteId,
        databaseId,
      })
      const block = Editor.above(editor as any, {
        match: (n) => Editor.isBlock(editor as any, n as any),
      })

      const path = findNodePath(editor, element)
      // console.log('=======block:', block, 'element:', element, 'path:', path)

      const { id } = await api.database.addRefBlockRecord.mutate({
        siteId,
        databaseId,
        refBlockId: (block?.[0] as any)?.id,
      })

      setNodes<TTagElement>(editor, { recordId: id }, { at: path })
    },
  },
}))
