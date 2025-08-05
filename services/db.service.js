

import { MongoClient } from 'mongodb'

export const dbService = {
  getCollection,
}

let dbConn = null

// Don't log immediately - wait for dotenv to load
function logDebugInfo() {
  console.log('DEBUG: Attempting to connect to MongoDB...')
  console.log('DEBUG: MONGO_URL =', process.env.MONGO_URL)
  console.log('DEBUG: DB_NAME =', process.env.DB_NAME || 'pixieshelf')
}

async function getCollection(collectionName) {
  try {
    logDebugInfo() // Log debug info when first called
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
    const db = client.db(process.env.DB_NAME || 'pixieshelf')
    dbConn = db
    console.log('Connected to MongoDB')
    return db
  } catch (err) {
    console.error('Cannot connect to MongoDB', err)
    throw err
  }
}
