

import { MongoClient } from 'mongodb'

export const dbService = {
  getCollection,
}

let dbConn = null


async function getCollection(collectionName) {
  try {
    const db = await connect()
    return db.collection(collectionName)
  } catch (err) {
    console.error('Failed to get collection:', err)
    throw err
  }
}

async function connect() {
  if (dbConn) return dbConn
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MongoDB URL is not defined. Please check your .env file and ensure MONGO_URL is set.')
    }
    const client = await MongoClient.connect(process.env.MONGO_URL)
    const db = client.db('pixieshelf_db')
    dbConn = db
    console.log('Connected to MongoDB')
    return db
  } catch (err) {
    console.error('Cannot connect to MongoDB', err)
    throw err
  }
}
