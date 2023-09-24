import { nanoid } from 'nanoid'
import { SettingsType } from '@penx/constants'
import { ISpace } from './ISpace'

export function getNewSpace(name: string): ISpace {
  const spaceId = nanoid()
  return {
    id: spaceId,
    name,
    isActive: false,
    changes: {},
    catalogue: [],
    settings: {
      [SettingsType.SYNC]: {
        repo: '',
        githubToken: '',
        privateKey: '',
      },

      [SettingsType.APPEARANCE]: {},

      [SettingsType.PREFERENCES]: {},

      [SettingsType.HOTKEYS]: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}