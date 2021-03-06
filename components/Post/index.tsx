import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";
import style from 'components/Post/post.module.css'

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  //handle routing for published feed and drafts
  const handleRouter = () => post.published ?
    Router.push("/p/[id]", `/p/${post.id}`) :
    Router.push("/d/[id]", `/d/${post.id}`)
  return (
    <div  className={style.post}>
    <div onClick={handleRouter }>
      <h2>{post.title}</h2>
      <small>By {authorName}</small>
      <ReactMarkdown source={post.content} />
    </div>
    </div>
  );
};

export default Post;
