'use client'

import { ImagePreview } from '@/components/plate-ui/image-preview'
import { CaptionPlugin } from '@udecode/plate-caption/react'
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react'

export const mediaPlugins = [
  PlaceholderPlugin,
  ImagePlugin.extend({
    options: {
      disableUploadInsert: true,
    },
    render: { afterEditable: ImagePreview },
  }),
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin, MediaEmbedPlugin] },
  }),
] as const
