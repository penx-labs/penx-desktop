import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@penx/db'

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET as string,
    }),

    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
      httpOptions: {
        timeout: 10 * 1000,
      },
    }),
    CredentialsProvider({
      name: 'SelfHosted',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: '' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const [username, password] = (
          process.env.SELF_HOSTED_CREDENTIALS as string
        ).split('/')

        console.log('username, password:', username, password)

        if (
          username === credentials!.username &&
          password === credentials!.password
        ) {
          let user = await prisma.user.findFirst({
            where: { username, password },
          })

          if (!user) {
            user = await prisma.user.create({
              data: { username, password, name: username },
            })
          }

          return {
            id: user.id,
            name: user.username || user.name,
            email: user.email || '',
            image: '',
          }
        } else {
          return null
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    // maxAge: 2592000 * 30,
  },

  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: `/login`,
    verifyRequest: `/login`,
    error: '/login', // Error code passed in query string as ?error=
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // await initSpace(user.id, user.name!)
      return true
    },

    async jwt({ token, account, user, profile }) {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    async session({ session, token, user, ...rest }) {
      session.userId = token.uid as string
      ;(session.user as any).id = token.uid

      return session
    },
  },
}

export default NextAuth(authOptions)
