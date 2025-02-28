import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { appEmitter } from '@penx/event'
import { User } from '@penx/model'
import { setAuthorizedUser, setLocalSession, setSite } from '@penx/storage'
import { store } from '@penx/store'
import { api } from '@penx/trpc-client'

export type LoginByTokenValues = {
  token: string
}

export function useLoginByTokenForm() {
  const [loading, setLoading] = useState(false)
  const form = useForm<LoginByTokenValues>({
    defaultValues: { token: '' },
  })

  const onSubmit: SubmitHandler<LoginByTokenValues> = async (data) => {
    setLoading(true)
    try {
      const { token, ...user } = await api.user.loginByPersonalToken.mutate(
        data.token,
      )

      console.log('===========user:', user)

      store.setToken(token as string)
      store.user.setUser(new User(user as any))

      await setSite(user.site)

      await setLocalSession({
        userId: user.id,
        earlyAccessCode: user.earlyAccessCode as string,
        publicKey: user.publicKey as string,
        email: user.email as string,
        user: {
          name: user.name as string,
          email: user.email as string,
          image: user.avatar as string,
          id: user.id,
        },
      })

      await setAuthorizedUser(user)

      appEmitter.emit('LOGIN_BY_PERSONAL_TOKEN_SUCCESSFULLY')
    } catch (error) {
      console.log('====error:', error)

      toast.warning('Please input a valid token')
    }
    setLoading(false)
  }

  return { ...form, loading, onSubmit: form.handleSubmit(onSubmit) }
}
