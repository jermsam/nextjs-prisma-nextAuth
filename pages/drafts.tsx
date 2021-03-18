/**This page can't be statically rendered because it depends on a user
 *  who is authenticated. Pages like this that get their data dynamically based on 
 * an authenticated users are a great use 
 * case for server-side rendering (SSR) via getServerSideProps. */

 import React from 'react'
 import { GetServerSideProps } from 'next'
 import Layout from 'components/Layout'
 import Post, { PostProps } from 'components/Post'
 import { useSession, getSession } from 'next-auth/client'
 import prisma from 'data-store/prisma'
 
 export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
   const session = await getSession({ req })
  
   if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
   }
 
   const drafts = await prisma.post.findMany({
     where: {
       author: { email: session.user.email },
       published: false,
     },
     include: {
       author: {
         select: { name: true },
       },
     },
   })
   
   return {
     props: { drafts },
   }
 }
 
 type Props = {
   drafts: PostProps[]
 }
 
 const Drafts: React.FC<Props> = (props) => {
   const [session] = useSession()
 
   if (!session) {
     return (
       <Layout>
         <h1>My Drafts</h1>
         <div>You need to be authenticated to view this page.</div>
       </Layout>
     )
   }
 
   return (
     <Layout>
       <div className="page">
         <h1>My Drafts</h1>
         <main>
           {props.drafts.map((post) => (
             <div key={post.id} className="post">
               <Post post={post} />
             </div>
           ))}
         </main>
       </div>
      
     
     </Layout>
   )
 }
 
 export default Drafts