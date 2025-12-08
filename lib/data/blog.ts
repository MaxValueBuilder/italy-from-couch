export interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: string
  date: string
  readTime: string
  category: "Culture" | "Travel Tips" | "History" | "Food" | "Architecture"
  image: string
  featured?: boolean
}

export const blogPosts: BlogPost[] = [
  {
    id: "hidden-gems-rome",
    title: "10 Hidden Gems in Rome That Tourists Never See",
    excerpt:
      "Beyond the Colosseum and Trevi Fountain lies a Rome that only locals know. Discover secret courtyards, ancient churches, and neighborhood trattorias that have been serving authentic Roman cuisine for generations.",
    author: "Marco Rossi",
    date: "December 5, 2025",
    readTime: "5 min read",
    category: "Travel Tips",
    image: "/rome-hidden-gems-locals-secret.jpg",
    featured: true,
  },
  {
    id: "italian-coffee-guide",
    title: "The Art of Italian Coffee: A Guide to Ordering Like a Local",
    excerpt:
      "Learn the difference between a cappuccino and a macchiato, and why Italians never order coffee after 11 AM.",
    author: "Elena Ferrari",
    date: "December 3, 2025",
    readTime: "4 min read",
    category: "Culture",
    image: "/italian-coffee-cappuccino-espresso-culture.jpg",
  },
  {
    id: "oltrarno-florence",
    title: "Florence's Best Kept Secret: The Oltrarno District",
    excerpt:
      "Cross the Arno River to discover where Florentines really live, work, and eat away from the tourist crowds.",
    author: "Sofia Bianchi",
    date: "December 1, 2025",
    readTime: "6 min read",
    category: "Travel Tips",
    image: "/oltrarno-district-florence-locals.jpg",
  },
  {
    id: "venice-beyond-crowds",
    title: "Venice Beyond the Crowds: A Local's Guide to Authentic Experiences",
    excerpt:
      "Escape the main tourist routes and discover the quiet canals, local bacari, and neighborhood life that makes Venice special.",
    author: "Alessandro Conti",
    date: "November 28, 2025",
    readTime: "7 min read",
    category: "Travel Tips",
    image: "/venice-quiet-canals-authentic.jpg",
  },
  {
    id: "italian-gestures",
    title: "Understanding Italian Gestures: A Non-Verbal Communication Guide",
    excerpt: "Italians speak with their hands. Learn the most common gestures and what they really mean.",
    author: "Elena Ferrari",
    date: "November 25, 2025",
    readTime: "5 min read",
    category: "Culture",
    image: "/italian-gestures-communication-culture.jpg",
  },
  {
    id: "florence-duomo-history",
    title: "The History Behind Florence's Duomo: More Than Just a Beautiful Building",
    excerpt: "Discover the incredible engineering and artistic achievement that took over 140 years to complete.",
    author: "Sofia Bianchi",
    date: "November 22, 2025",
    readTime: "8 min read",
    category: "History",
    image: "/florence-duomo-cathedral-history-architecture.jpg",
  },
  {
    id: "roman-food-culture",
    title: "Roman Food Culture: What Makes Roman Cuisine Unique",
    excerpt:
      "From carbonara to cacio e pepe, learn about the dishes that define Roman cooking and where to find the best versions.",
    author: "Elena Ferrari",
    date: "November 20, 2025",
    readTime: "6 min read",
    category: "Food",
    image: "/roman-cuisine-carbonara-cacio-pepe.jpg",
  },
]
