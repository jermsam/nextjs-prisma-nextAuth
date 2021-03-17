import React from "react"
import { GetStaticProps } from "next"
import Layout from "../components/Layout"
import Post, { PostProps } from "components/Post"
import prisma from 'data-store/prisma'

/** this page can only be generated after fetching remote posts feed  at build time
 * subsequent page requests will retrieve the feed from cache
 * (SSG with data)
 * so lets update the cashed posts feed 
 * @revalidate after 60 seconds (ISR)
 */

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    // A where filter is specified to include only Post records where published is true
    where: { published: true },
    include: {
      author: {
        //The name of the author of the Post record is queried as well and will be included in the returned objects
        select: { name: true },
      },
    },
  })
  return { props: { feed },revalidate:60 }
}

type Props = {
  feed: PostProps[]
}

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Public Feed</h1>
        <main>
          {props.feed.map((post) => (
            
              <Post key={post.id} post={post} />
          
          ))}
        </main>
      </div>
    
    </Layout>
  )
}

export default Blog
