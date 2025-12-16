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
