"use client"

import { useI18n } from "@/lib/i18n/context"
import { blogPosts } from "@/lib/data/blog"
import Link from "next/link"
import { Clock, User, ArrowRight } from "lucide-react"

export function BlogSection() {
  const { t } = useI18n()

  // Get featured post and all other posts
  const featured = blogPosts.find((post) => post.featured)
  const recent = blogPosts.filter((post) => !post.featured)

  return (
    <section id="blog" className="py-16 md:py-24 bg-background px-4 scroll-mt-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section header */}
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Blog</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("blog.heroTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("blog.heroSubtitle")}</p>
        </div>

        {/* Featured Post */}
        {featured && (
          <Link href={`/blog/${featured.id}`} className="group block">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
              <div className="relative h-64 rounded-lg overflow-hidden bg-border">
                <img
                  src={featured.image || "/placeholder.svg"}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded bg-orange-600 text-white text-xs font-semibold uppercase">
                    Featured
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{featured.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{new Date(featured.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-muted-foreground line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all">
                  <span>Read More</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* All Posts */}
        {recent.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-border">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                    />
                  </div>
                  <div className="p-6 space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm group-hover:gap-3 transition-all pt-2">
                      <span>Read More</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

