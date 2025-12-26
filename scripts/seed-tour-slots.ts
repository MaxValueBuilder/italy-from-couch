/**
 * Seed script to create sample tour slots for testing the booking system
 * Run this script with: npx tsx scripts/seed-tour-slots.ts
 */

import { MongoClient } from "mongodb"
import { addDays, setHours, setMinutes } from "date-fns"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

// Create slots for the next 7 days
async function seedTourSlots() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")
    const slots = db.collection("tourSlots")

    // Get all tours
    const toursList = await tours.find({}).toArray()
    console.log(`Found ${toursList.length} tours`)

    if (toursList.length === 0) {
      console.log("No tours found. Please seed tours first.")
      return
    }

    // Create slots for each tour
    for (const tour of toursList) {
      console.log(`Creating slots for tour: ${tour.title}`)

      const timezone = "Europe/Rome"
      const today = new Date()
      const slotsToCreate = []

      // Create slots for the next 7 days
      for (let day = 1; day <= 7; day++) {
        const date = addDays(today, day)

        // Create morning slot (10:00 AM)
        const morningStart = setMinutes(setHours(date, 10), 0)
        const morningEnd = new Date(morningStart.getTime() + (tour.duration || 90) * 60 * 1000)

        slotsToCreate.push({
          tourId: tour._id.toString(),
          guideId: tour.guide || "",
          startTime: morningStart,
          endTime: morningEnd,
          timezone,
          maxParticipants: 50,
          bookedCount: 0,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Create afternoon slot (2:00 PM) for all tours
        const afternoonStart = setMinutes(setHours(date, 14), 0)
        const afternoonEnd = new Date(
          afternoonStart.getTime() + (tour.duration || 90) * 60 * 1000
        )

        slotsToCreate.push({
          tourId: tour._id.toString(),
          guideId: tour.guide || "",
          startTime: afternoonStart,
          endTime: afternoonEnd,
          timezone,
          maxParticipants: 50,
          bookedCount: 0,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      // Insert slots
      if (slotsToCreate.length > 0) {
        await slots.insertMany(slotsToCreate)
        console.log(`Created ${slotsToCreate.length} slots for ${tour.title}`)
      }
    }

    console.log("Seed completed!")
  } catch (error) {
    console.error("Error seeding tour slots:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedTourSlots()

