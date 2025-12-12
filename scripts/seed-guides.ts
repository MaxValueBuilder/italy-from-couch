/**
 * Seed script to populate guides in MongoDB
 * Run this script with: npx tsx scripts/seed-guides.ts
 */

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

const guidesData = [
  {
    name: "Marco Rossi",
    city: "Rome",
    specialties: ["Ancient history", "Archaeology", "Hidden gems"],
    languages: ["Italian", "English", "Spanish"],
    bio: "Born and raised in Rome, Marco has been sharing the city's secrets for over 10 years. He has a degree in archaeology and knows every stone in the Eternal City.",
    image: "/marco-italian-guide-rome-archaeology.jpg",
  },
  {
    name: "Sofia Bianchi",
    city: "Florence",
    specialties: ["Renaissance art", "Architecture", "Local culture"],
    languages: ["Italian", "English", "French"],
    bio: "Sofia is an art historian who fell in love with Florence's beauty. She'll show you the city through the eyes of the artists who made it famous.",
    image: "/sofia-italian-art-historian-florence-renaissance.jpg",
  },
  {
    name: "Alessandro Conti",
    city: "Venice",
    specialties: ["Venetian history", "Local secrets", "Photography"],
    languages: ["Italian", "English"],
    bio: "Alessandro has lived in Venice his entire life. He knows every canal, every hidden corner, and every story that makes Venice magical.",
    image: "/alessandro-italian-guide-venice-canals.jpg",
  },
  {
    name: "Elena Ferrari",
    city: "Rome",
    specialties: ["Food culture", "Neighborhoods", "Local life"],
    languages: ["Italian", "English", "German"],
    bio: "Elena is a food writer and local expert who knows where Romans really eat. She'll show you the authentic side of Rome beyond the tourist spots.",
    image: "/elena-italian-food-writer-rome.jpg",
  },
  {
    name: "Luca Romano",
    city: "Florence",
    specialties: ["Photography", "Golden hour tours", "Local stories"],
    languages: ["Italian", "English"],
    bio: "Luca is a photographer who captures Florence's beauty at the perfect moments. Join him for stunning sunset walks and learn photography tips.",
    image: "/luca-italian-photographer-florence-sunset.jpg",
  },
  {
    name: "Giulia Marchetti",
    city: "Venice",
    specialties: ["Morning tours", "Local markets", "Daily life"],
    languages: ["Italian", "English", "French"],
    bio: "Giulia starts her day early to show you Venice as locals see it. From morning markets to quiet canals, she'll share the authentic Venetian lifestyle.",
    image: "/giulia-italian-guide-venice-markets.jpg",
  },
]

async function seedGuides() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("italy-from-couch")
    const guides = db.collection("guides")
    const tours = db.collection("tours")

    // First, fetch all tours to map guide names to tour IDs
    const allTours = await tours.find({}).toArray()
    console.log(`Found ${allTours.length} tours in database`)

    // Create a mapping of guide identifier to tour IDs
    // The guide field in tours might be the guide ID or first name
    const guideToToursMap: Record<string, string[]> = {}
    allTours.forEach((tour) => {
      if (tour.guide) {
        const guideKey = tour.guide.toLowerCase().trim()
        if (!guideToToursMap[guideKey]) {
          guideToToursMap[guideKey] = []
        }
        guideToToursMap[guideKey].push(tour._id.toString())
      }
    })

    console.log(`Seeding ${guidesData.length} guides...`)

    for (const guide of guidesData) {
      const guideTours: string[] = []

      // Try multiple matching strategies:
      // 1. Match by first name (e.g., "Marco" matches guide field "Marco")

      // Match by first name (e.g., "Marco" matches guide field "Marco")
      const firstName = guide.name.split(" ")[0].toLowerCase()
      if (guideToToursMap[firstName]) {
        guideToToursMap[firstName].forEach((tourId) => {
          if (!guideTours.includes(tourId)) {
            guideTours.push(tourId)
          }
        })
      }

      // Match by full name (case-insensitive)
      const fullName = guide.name.toLowerCase()
      if (guideToToursMap[fullName]) {
        guideToToursMap[fullName].forEach((tourId) => {
          if (!guideTours.includes(tourId)) {
            guideTours.push(tourId)
          }
        })
      }

      // Check all tours for partial matches
      allTours.forEach((tour) => {
        if (tour.guide) {
          const tourGuide = tour.guide.toLowerCase().trim()
          // Check if tour guide matches first name or is contained in guide name
          if (
            tourGuide === firstName ||
            guide.name.toLowerCase().includes(tourGuide) ||
            tourGuide.includes(firstName)
          ) {
            const tourId = tour._id.toString()
            if (!guideTours.includes(tourId)) {
              guideTours.push(tourId)
            }
          }
        }
      })

      const guideDataWithTours = {
        ...guide,
        tours: guideTours,
        toursCount: undefined, // Remove toursCount
      }
      delete guideDataWithTours.toursCount

      // Check if guide already exists by name
      const existingGuide = await guides.findOne({ name: guide.name, city: guide.city })
      
      if (existingGuide) {
        // Update existing guide
        await guides.updateOne(
          { _id: existingGuide._id },
          {
            $set: {
              ...guideDataWithTours,
              updatedAt: new Date(),
            },
          }
        )
        console.log(`✓ Updated guide: ${guide.name} (${guideTours.length} tours) - ID: ${existingGuide._id.toString()}`)
      } else {
        // Insert new guide
        const result = await guides.insertOne({
          ...guideDataWithTours,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log(`✓ Created guide: ${guide.name} (${guideTours.length} tours) - ID: ${result.insertedId.toString()}`)
      }
    }

    console.log("Seed completed!")
  } catch (error) {
    console.error("Error seeding guides:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedGuides()

