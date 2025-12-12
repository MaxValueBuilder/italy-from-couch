/**
 * Seed script to add the Civitatis "Free tour dei misteri e delle leggende di Roma" to MongoDB
 * Run this script with: npx tsx scripts/seed-civitatis-tour.ts
 */

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set")
  process.exit(1)
}

const civitatisTour = {
  title: "Free tour dei misteri e delle leggende di Roma",
  city: "Rome",
  duration: 120, // 2 hours (can be 2-2.5 hours)
  guide: "Anna", // Based on reviews mentioning Anna
  schedule: "Evening tour - Check availability for specific times",
  highlights: [
    "Piazza del Popolo",
    "Chiesa di Santa Maria del Popolo",
    "Via del Corso",
    "Via di Ripetta",
    "Chiesa di Sant'Agostino",
    "Biblioteca Angelica",
    "Ponte di Sant'Angelo",
  ],
  images: [
    "/rome-mysteries-legends-1.jpg", // Colosseum at night
    "/rome-mysteries-legends-2.jpg", // Roman square with St. Peter's
    "/rome-mysteries-legends-3.jpg", // Classical painting (Madonna and Child)
    "/rome-mysteries-legends-4.jpg", // Historic library interior
    "/rome-mysteries-legends-5.jpg", // Tiber River and St. Peter's at dusk
  ],
  streamUrl: null,
  isLive: false,
  streamType: null,
  description:
    "Partecipate a questo free tour serale di Roma e scoprite i monumenti della capitale, avvolti dalle luci della sera. Un itinerario che vi sorprenderà!",
  itinerary: `Assassini, atei, prostitute... Durante il Medioevo, i cittadini romani più disprezzati furono sepolti, dimenticati e sfrattati nel cosiddetto "cimitero maledetto". I resti di questo antico cimitero si trovano a pochi passi da Piazza del Popolo, punto di partenza del nostro free tour dei misteri e delle leggende di Roma.

Si vocifera che la sera, nei pressi di Piazzale Flaminio e Piazza del Popolo... Ripensandoci, meglio non metterlo per iscritto. Se volete saperne di più, dovrete presentarvi all'orario indicato nel punto di incontro stabilito! Accanto a queste piazze vedremo la chiesa di Santa Maria del Popolo, dove vi sveleremo gli enigmi contenuti nelle opere di due maestri del Barocco: il pittore Caravaggio e lo scultore Bernini.

Proseguiremo il nostro free tour lungo Via del Corso, dove conosceremo le orrende perversioni di Papa Paolo II. Ci dirigeremo poi verso via di Ripetta, dove parleremo ancora una volta di un papa, in questo caso Leone X, che introdusse un'inedita tassa sulla prostituzione che trasformò la città...

Le meretrici divennero molto popolari a Roma. Tanto che Caravaggio utilizzò l'immagine di una prostituta per dipingere... Il volto di una vergine! Non ci credete? Lo scopriremo nella chiesa di Sant'Agostino, situata accanto alla famosa Biblioteca Angelica.

Dopo un itinerario che durerà tra le due ore e le due ore e mezza, concluderemo il tour in corrispondenza di Ponte di Sant'Angelo, uno dei ponti più belli di Roma, dove vi racconteremo le leggende più oscure della Città Eterna.`,
  meetingPoint: "Piazza del Popolo, Roma",
  bookingDates: [], // Will be populated based on availability
  details: {
    duration: "2-2.5 hours",
    language: "Italian, English",
    groupSize: "Maximum group size varies",
    included: ["Professional guide", "Free tour (tips-based)"],
    notIncluded: ["Food and drinks", "Transportation", "Entrance fees to monuments"],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

async function seedTour() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("italy-from-couch")
    const tours = db.collection("tours")

    // Check if tour already exists by title
    const existingTour = await tours.findOne({ title: civitatisTour.title })
    if (existingTour) {
      console.log("Tour already exists. Updating...")
      await tours.updateOne(
        { title: civitatisTour.title },
        {
          $set: {
            ...civitatisTour,
            updatedAt: new Date(),
          },
        }
      )
      console.log("Tour updated successfully!")
    } else {
      await tours.insertOne(civitatisTour)
      console.log("Tour created successfully!")
    }

    console.log("Seed completed!")
  } catch (error) {
    console.error("Error seeding tour:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log("MongoDB connection closed")
  }
}

seedTour()

