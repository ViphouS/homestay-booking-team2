import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { format } from "date-fns"

import { useBlogPosts } from "@/hooks/use-blog-posts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-[#AEBBA8] to-[#203C2D] sm:h-80 md:h-[420px]" />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-64 w-full rounded-2xl object-cover sm:h-80 md:h-[420px]"
    />
  )
}

export function BlogPost() {
  const { slug } = useParams()
  const { posts, hasError } = useBlogPosts()

  if (posts === null)
    return <div className="p-10 text-center text-gray-500">Loading...</div>
  if (hasError)
    return (
      <div className="p-10 text-center text-gray-500">
        Couldn't load the blog post right now.
      </div>
    )

  const post = posts.find((p) => p.slug === slug)
  if (!post)
    return <div className="p-10 text-center text-gray-500">Post not found</div>

  return (
    <main className="mx-auto max-w-[840px] px-4 py-10 text-gray-800 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex gap-2 text-sm text-gray-500">
        <Link to="/blog">Blog</Link>
        <span className="mx-1">/</span>
        <span>{post.category}</span>
      </nav>

      {/* Title */}
      <Badge className="mb-3">{post.category}</Badge>
      <h1 className="mb-4 font-heading text-3xl leading-tight text-primary md:text-4xl">
        {post.title}
      </h1>

      {/* Author + date */}
      <div className="mb-8 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <div className="font-medium text-primary">{post.author.name}</div>
          <div className="text-gray-500">
            {format(new Date(post.publishedAt), "MMMM d, yyyy")}
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="mb-10 overflow-hidden rounded-2xl">
        <HeroImage src={post.coverImage} alt={post.title} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4">
        {post.content.map((paragraph, index) => (
          <p
            key={index}
            className="text-base leading-relaxed text-pretty text-gray-700"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Tags */}
      {post.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-1.5 border-t border-border pt-6">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </main>
  )
}

export default BlogPost
