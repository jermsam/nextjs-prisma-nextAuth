import React from "react"
import { GetServerSideProps } from "next"
import ReactMarkdown from "react-markdown"
import Layout from "components/Layout"
import { PostProps } from "components/Post"
import prisma from 'data-store/prisma'

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  })
  return {
    props: post,
  }
}

const Post: React.FC<PostProps> = (props) => {
  let title = props.title
  if (!props.published) {
    title = `${title} (Draft)`
  }

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || "Unknown author"}</p>
        <ReactMarkdown source={props.content} />
      </div>
      <style jsx>{`
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  )
}

export default Post

/** Why not ISR Here? 
 * 
 * getStaticProps should only be used for pages that do not require authentication. 
 * The statically generated  pages will be publicly available via your server 
 * and via a CDN if you have one. Therefore they cannot contain any personal 
 * or sensitive data.

Also, this is why there is no req and res objects for getStaticProps, 
because the pages are generated at build time, not at runtime. And at build time,
 there is no user http request to handle.
*/