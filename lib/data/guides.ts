export interface Guide {
  _id: string
  name: string
  city: string
  specialties: string[]
  languages: string[]
  bio: string
  tours: string[] // Array of tour IDs from tours table
  image: string
  createdAt?: Date
  updatedAt?: Date
}

export const guides: Guide[] = [
  {
    id: "marco",
    name: "Marco Rossi",
    city: "Rome",
    specialties: ["Ancient history", "Archaeology", "Hidden gems"],
    languages: ["Italian", "English", "Spanish"],
    bio: "Born and raised in Rome, Marco has been sharing the city's secrets for over 10 years. He has a degree in archaeology and knows every stone in the Eternal City.",
    toursCount: 3,
    image: "/marco-italian-guide-rome-archaeology.jpg",
  },
  {
    id: "sofia",
    name: "Sofia Bianchi",
    city: "Florence",
    specialties: ["Renaissance art", "Architecture", "Local culture"],
    languages: ["Italian", "English", "French"],
    bio: "Sofia is an art historian who fell in love with Florence's beauty. She'll show you the city through the eyes of the artists who made it famous.",
    toursCount: 2,
    image: "/sofia-italian-art-historian-florence-renaissance.jpg",
  },
  {
    id: "alessandro",
    name: "Alessandro Conti",
    city: "Venice",
    specialties: ["Venetian history", "Local secrets", "Photography"],
    languages: ["Italian", "English"],
    bio: "Alessandro has lived in Venice his entire life. He knows every canal, every hidden corner, and every story that makes Venice magical.",
    toursCount: 2,
    image: "/alessandro-italian-guide-venice-canals.jpg",
  },
  {
    id: "elena",
    name: "Elena Ferrari",
    city: "Rome",
    specialties: ["Food culture", "Neighborhoods", "Local life"],
    languages: ["Italian", "English", "German"],
    bio: "Elena is a food writer and local expert who knows where Romans really eat. She'll show you the authentic side of Rome beyond the tourist spots.",
    toursCount: 1,
    image: "/elena-italian-food-writer-rome.jpg",
  },
  {
    id: "luca",
    name: "Luca Romano",
    city: "Florence",
    specialties: ["Photography", "Golden hour tours", "Local stories"],
    languages: ["Italian", "English"],
    bio: "Luca is a photographer who captures Florence's beauty at the perfect moments. Join him for stunning sunset walks and learn photography tips.",
    toursCount: 1,
    image: "/luca-italian-photographer-florence-sunset.jpg",
  },
  {
    id: "giulia",
    name: "Giulia Marchetti",
    city: "Venice",
    specialties: ["Morning tours", "Local markets", "Daily life"],
    languages: ["Italian", "English", "French"],
    bio: "Giulia starts her day early to show you Venice as locals see it. From morning markets to quiet canals, she'll share the authentic Venetian lifestyle.",
    toursCount: 1,
    image: "/giulia-italian-guide-venice-markets.jpg",
  },
]
