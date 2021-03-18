import React from "react"
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next"
import ReactMarkdown from "react-markdown"
import Layout from "components/Layout"
import { PostProps } from "components/Post"
import prisma from 'data-store/prisma'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/client'
import Router from 'next/router'

// This also gets called at build time
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // params contains the post `id`.
  // If the route is like /posts/1, then params.id is 1
  const post = await prisma.post.findFirst({
    where: {
      published: true,
      id: Number(params?.id) || -1,
      
    },
    
    include: {
      author: {
        select: { name: true,image:true,email:true},
      },
    },
  })
   // Pass post data to the page via props
  return {
    // fallback: true will not update generated pages, 
    //for that we use Incremental Static Regeneration.
    props: {post},revalidate:60
  }
}
// This function gets called during pre-rendering
export const getStaticPaths: GetStaticPaths = async () => {
  // 2. Or call an external API endpoint to get posts get only 3 fr starters
  const posts = await prisma.post.findMany({
   
    // A where filter is specified to include only Post records where published is true
    where: { published: true },
     // only two
     take: 2,
    include: {
      author: {
        select: { name: true,image:true,email:true},
      },
    },
  })
  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post) => ({
    params: { id: post.id },
  }))
  // ...
  return {
    // We'll pre-render only these paths at build time.
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } } ,// See the "paths" section below
     
    ],
    /** @falback what should be done to other post routtes at build time
     * { fallback: false } means other routes should 404.
     * 
     * { fallback: true} means 
     *  - a fallback version of the page is rendereed on the 1st reques
     *  - then server will perform SSG in the background through @getStticProps
     *  - then afterwards browser receives JSON for the generted path and automatically render it to page
     *  - in the user's eyes, page will be swapped from feedback page to full page
     *  -then at that same time this path in question will be added to the list of prerendered pages
     *  Fallback pages
          In the “fallback” version of a page:
          - The page’s props will be empty.
          - Using the router, you can detect if the fallback is being rendered, router.isFallback will be true.
    *   When is fallback: true useful?
          -fallback: true is useful if your app has a very large number of static pages 
          that depend on data (think: a very large e-commerce site). 
          -You want to pre-render all product pages, but then your builds would take forever.
          Instead, you may statically generate a small subset of pages 
          and use fallback: true for the rest. When someone requests a page 
          that’s not generated yet, the user will see the page with a loading indicator. 
          Shortly after, getStaticProps finishes and the page will be rendered with 
          the requested data.From now on, everyone who requests the same
          page will get the statically pre-rendered page.
          This ensures that users always have a fast experience 
          while preserving fast builds and the benefits of Static
    * 
    */
    fallback: true
    /**{fallback: 'blocking'} means 
     *  new paths not returned by getStaticPaths will wait for the HTML 
     *  to be generated, identical to SSR (hence why blocking), 
     *  and then be cached for future requests so it only happens once per path.
     * 
     * getStaticProps will behave as follows:
     * - The paths returned from getStaticPaths will be rendered to HTML at build time by getStaticProps.
     * - The paths that have not been generated at build time will not result in a 404 page.
     * - Instead nextjs will SSR on the first request and return the generated HTML.
     * -When that’s done, the browser receives the HTML for the generated path. 
     * From the user’s perspective, it will transition from "the browser is requesting 
     * the page" to "the full page is loaded". There is no flash of loading/fallback state.
     * At the same time,nextjs adds this path to the list of pre-rendered pages.
     *  Subsequent requests to the same path 
     * will serve the generated page, like other pages pre-rendered at build time.
     */
  };
}

//delete it
async function deletePost(id: number): Promise<void> {
  await fetch(`http://localhost:3000/api/post/${id}`, {
    method: 'DELETE',
  })
  Router.push('/')
}




const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const [session, loading] = useSession()
  
  const router = useRouter()
  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback||!post) {
    return <div>No such post ...</div>
  }
  let title = post.title
  if (!post.published) {
    title = `${title} (Draft)`
  }

  const userHasValidSession = Boolean(session)


  
  const postBelongsToUser = session?.user?.email === post?.author?.email

  return (
    <Layout>
      <div>
     
        <h2>{title}</h2>
        <p>By {post?.author?.name || "Unknown author"}</p>
        <ReactMarkdown source={post.content} />
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

export default Post

/** Why ISR Here? 
 * 
 * getStaticProps can be used for published posts feed coz they do not require authentication. 
 * The statically generated  pages will be publicly available via your server 
 * and via a CDN if you have one. Therefore these donot contain any personal 
 * or sensitive data.
Also, this is why there is no req and res objects for getStaticProps, 
because the pages are generated at build time, not at runtime. And at build time,
 there is no user http request to handle.
*/