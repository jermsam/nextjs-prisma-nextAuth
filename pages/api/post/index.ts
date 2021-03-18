
import { getSession } from 'next-auth/client'
import prisma from 'data-store/prisma'

// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req, res) {
  /**First it extracts the title and cotent from the body of the 
   * incoming HTTP POST request */

  const { title, content } = req.body
/**. After that, it checks whether the request is coming from an 
 * authenticated user with the getSession helper function from NextAuth.js.  */
  const session = await getSession({ req })
  /**And finally, it uses Prisma Client to create a new Post record in the database. */
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { email: session?.user?.email } },
    },
  })
  res.json(result)
}