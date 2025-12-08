"use client"

import { useI18n } from "@/lib/i18n/context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { blogPosts } from "@/lib/data/blog"
import Link from "next/link"
import { Clock, User } from "lucide-react"

export default function BlogPage() {
  const { t } = useI18n()

  const featured = blogPosts.find((post) => post.featured)
  const regular = blogPosts.filter((post) => !post.featured)
  const categories = Array.from(new Set(blogPosts.map((post) => post.category)))

  return (
    <>
      <Header />
      <main className="bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">{t("blog.heroTitle")}</h1>
            <p className="text-lg text-muted-foreground">{t("blog.heroSubtitle")}</p>
          </div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className="py-16 md:py-24 px-4 border-b border-border">
            <div className="max-w-6xl mx-auto">
              <Link href={`/blog/${featured.id}`} className="group cursor-pointer">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-border">
                    <img
                      src={featured.image || "/placeholder.svg"}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 rounded bg-orange-100 dark:bg-orange-900">
                      <span className="text-orange-900 dark:text-orange-100 text-xs font-semibold uppercase">
                        {t("blog.featured")}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground group-hover:text-orange-600 transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{featured.excerpt}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        {featured.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {featured.readTime}
                      </div>
                      <span>{featured.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Category filter info */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("blog.categories")}: {categories.join(", ")}
              </p>
            </div>

            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regular.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group cursor-pointer transition-all hover:scale-105"
                >
                  <div className="space-y-4 h-full flex flex-col">
                    <div className="relative h-48 rounded-lg overflow-hidden bg-border flex-shrink-0">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="text-xs font-semibold uppercase bg-orange-600 text-white px-2 py-1 rounded">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed flex-1">{post.excerpt}</p>

                      <div className="border-t border-border pt-3 mt-auto">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <span>{post.readTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
