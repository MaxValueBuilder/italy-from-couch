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
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/7fde7f7b-72b8-530f-bdc4-8c918c96b807/8fd6dd7e-a23b-57b4-a668-ae8c2053ad85.jpg",
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
    image: "https://st.perplexity.ai/estatic/0b226c450798410ac541646c86ec31afd840e5beab817a5d84fa821e7db61981ec84c3b4a3f072a7a2e1899c9fb06c6e541dfcc6b405ac4a721ae16531015c1f96f0ac379f6e6b343c98f31ae98e8ce3b9eb42a0a0fb07fc013bcbd4c71b59ad8e1da5dfff5767c2ec6de2d2bcc45b2d",
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
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/975cd9c3-cd59-5683-95e9-fd5951f9ba2c/54e3eefc-1597-5f4c-bd5a-8489aeec055b.jpg",

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
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/9f0c68a2-6d65-5452-bafa-a3e520518f3e/1c118318-68fb-55c0-956e-ea495bf0310c.jpg",
  },
  {
    id: "italian-gestures",
    title: "Understanding Italian Gestures: A Non-Verbal Communication Guide",
    excerpt: "Italians speak with their hands. Learn the most common gestures and what they really mean.",
    author: "Elena Ferrari",
    date: "November 25, 2025",
    readTime: "5 min read",
    category: "Culture",
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/9ea742c2-29af-5008-9e4f-bcf044637c83/dee32b38-1dc3-55a3-ae5e-ffe8ed589a3c.jpg",
  },
  {
    id: "florence-duomo-history",
    title: "The History Behind Florence's Duomo: More Than Just a Beautiful Building",
    excerpt: "Discover the incredible engineering and artistic achievement that took over 140 years to complete.",
    author: "Sofia Bianchi",
    date: "November 22, 2025",
    readTime: "8 min read",
    category: "History",
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/a5dee3ce-949a-504b-acb3-f966cfceebc3/020ab10a-dcd7-5052-824a-baa41b75c50e.jpg",
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
    image: "https://d2u1z1lopyfwlx.cloudfront.net/thumbnails/f5144290-208d-58eb-9b57-1025594775ad/7a6c4916-405a-580a-afd5-e0a1efaeb5c4.jpg",
  },
]
