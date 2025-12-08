export interface Tour {
  id: string
  title: string
  city: "Rome" | "Florence" | "Venice"
  duration: number
  guide: string
  schedule: string
  highlights: string[]
  image: string
}

export const tours: Tour[] = [
  {
    id: "rome-ancient",
    title: "Rome: Ancient Wonders Walk",
    city: "Rome",
    duration: 90,
    guide: "Marco",
    schedule: "Daily at 10:00 AM & 4:00 PM (CET)",
    highlights: ["Colosseum", "Roman Forum", "Palatine Hill"],
    image: "/colosseum-rome-ancient-history.jpg",
  },
  {
    id: "florence-art",
    title: "Florence: Renaissance Art & Architecture",
    city: "Florence",
    duration: 75,
    guide: "Sofia",
    schedule: "Daily at 11:00 AM & 3:00 PM (CET)",
    highlights: ["Duomo", "Ponte Vecchio", "Uffizi Gallery exterior"],
    image: "/florence-duomo-renaissance-art.jpg",
  },
  {
    id: "venice-canals",
    title: "Venice: Hidden Canals & Local Secrets",
    city: "Venice",
    duration: 60,
    guide: "Alessandro",
    schedule: "Daily at 9:00 AM & 5:00 PM (CET)",
    highlights: ["Secret canals", "Local neighborhoods", "Authentic bacari"],
    image: "/venice-canals-hidden-secrets.jpg",
  },
  {
    id: "rome-food",
    title: "Rome: Trastevere Food & Culture",
    city: "Rome",
    duration: 90,
    guide: "Elena",
    schedule: "Daily at 12:00 PM (CET)",
    highlights: ["Local trattorias", "Artisan shops", "Neighborhood stories"],
    image: "/rome-trastevere-food-culture.jpg",
  },
  {
    id: "florence-sunset",
    title: "Florence: Sunset Over the Arno",
    city: "Florence",
    duration: 60,
    guide: "Luca",
    schedule: "Daily at 6:00 PM (CET)",
    highlights: ["Golden hour views", "Oltrarno district", "Local life"],
    image: "/florence-sunset-arno-golden-hour.jpg",
  },
  {
    id: "venice-markets",
    title: "Venice: Morning Markets & Local Life",
    city: "Venice",
    duration: 75,
    guide: "Giulia",
    schedule: "Daily at 8:00 AM (CET)",
    highlights: ["Rialto Market", "Morning routines", "Authentic Venice"],
    image: "/venice-rialto-market-morning.jpg",
  },
]
