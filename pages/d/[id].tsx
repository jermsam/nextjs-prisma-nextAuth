import React from 'react'
import { GetServerSideProps } from 'next'
import ReactMarkdown from 'react-markdown'
import Layout from 'components/Layout'
import Router from 'next/router'
import { PostProps } from 'components/Post'
import { useSession, getSession } from 'next-auth/client'
import prisma from 'data-store/prisma'

export const getServerSideProps: GetServerSideProps = async ({ req, res,params }) => {
  const session = await getSession({ req })
  if (!session) {
   
    //////////////////////////////////////////////////// 
    // if not authenticated just redirect to home page
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
    ///////////////////////////////////////////////////
    
  }

  const post = await prisma.post.findFirst({
    where: {
      published:false,
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  })
  return {
    props: {post},
  }
}



async function publishPost(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/publish/${id}`, {
    method: 'PUT',
  })
  await Router.push('/')
}

async function deletePost(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/post/${id}`, {
    method: 'DELETE',
  })
  Router.push('/')
}

const Draft: React.FC<{ post: PostProps }> = ({post}) => {
  const [session, loading] = useSession()
 
  if (loading) {
    return <div>Authenticating ...</div>
  }
  const userHasValidSession = Boolean(session)
  
  const postBelongsToUser = session?.user?.email === post?.author?.email
  let title = post?.title
  if (!post?.published) {
    title = `${title} (Draft)`
  }



  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {post?.author?.name || 'Unknown author'}</p>
        <ReactMarkdown source={post.content} />
        {!post.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(post.id)}>Publish</button>
        )}
        {
  userHasValidSession && postBelongsToUser && (
    <button onClick={() => deletePost(post.id)}>Delete</button>
  )
}
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

export default Draft