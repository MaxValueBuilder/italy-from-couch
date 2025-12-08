"use client"

import { useParams, useRouter } from "next/navigation"
import { blogPosts } from "@/lib/data/blog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, User, ArrowLeft } from "lucide-react"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const post = blogPosts.find((p) => p.id === postId)

  if (!post) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-2xl text-muted-foreground">Post not found</p>
        </main>
        <Footer />
      </>
    )
  }

  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 3)

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Image */}
        <section className="relative h-96 md:h-[500px] overflow-hidden">
          <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <span className="inline-block bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold max-w-3xl">{post.title}</h1>
            </div>
          </div>
        </section>

        {/* Article Meta */}
        <section className="py-8 border-b border-border">
          <div className="max-w-3xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User size={16} />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {post.readTime}
              </div>
              <span>{post.date}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 md:py-20 px-4">
          <article className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>{post.excerpt}</p>

            <div className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p>
                {post.title} is more than just a story—it's an insight into authentic Italian culture and experiences.
                In this article, we explore the nuances that make Italy truly special, guided by our local experts who
                live and breathe the culture every day.
              </p>
            </div>

            <div className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">The Experience</h2>
              <p>
                Our guides are passionate about sharing the real Italy—not the tourist version, but the authentic
                experiences that locals enjoy. Whether it's understanding coffee culture, discovering hidden
                neighborhoods, or learning about history through personal stories, our tours provide a unique
                perspective.
              </p>
            </div>

            <div className="space-y-4 text-foreground">
              <h2 className="text-2xl font-bold">Why It Matters</h2>
              <p>
                Understanding Italian culture, history, and local life enriches your appreciation of this incredible
                country. Through our live tours and articles, we hope to inspire a deeper connection with Italy and its
                people—whether you're visiting in person or joining us from your couch.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-2">
                Ready to experience this yourself?
              </h3>
              <p className="text-orange-800 dark:text-orange-200 mb-4">
                Join one of our live tours with {post.author} and thousands of other explorers experiencing Italy from
                home.
              </p>
              <Link href="/tours">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">Browse Tours</Button>
              </Link>
            </div>
          </article>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 md:py-24 px-4 bg-card border-t border-border">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">Related Articles</h2>
                <p className="text-lg text-muted-foreground">More {post.category} stories</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="group cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="space-y-4 h-full flex flex-col">
                      <div className="relative h-48 rounded-lg overflow-hidden bg-border flex-shrink-0">
                        <img
                          src={relatedPost.image || "/placeholder.svg"}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                        />
                      </div>

                      <div className="space-y-2 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{relatedPost.excerpt}</p>

                        <div className="text-xs text-muted-foreground">{relatedPost.author}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
