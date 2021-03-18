import { NextApiHandler } from 'next'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from 'data-store/prisma'


const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
}

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options)
export default authHandler