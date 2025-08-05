import { dbService } from './db.service.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'

export const userService = {
  query,
  getById,
  add,
  update,
  remove,
  getByEmail,
}

async function query(filterBy = {}) {
  const criteria = {}
  if (filterBy.txt) {
    criteria.email = { $regex: filterBy.txt, $options: 'i' }
  }
  const collection = await dbService.getCollection('users')
  return await collection.find(criteria).toArray()
}

async function getById(userId) {
  const collection = await dbService.getCollection('users')
  return await collection.findOne({ _id: new ObjectId(userId) })
}

async function getByEmail(email) {
  const collection = await dbService.getCollection('users')
  return await collection.findOne({ email })
}

async function add(user) {
  const collection = await dbService.getCollection('users')
  
  // Check if user with this email already exists
  const existingUser = await getByEmail(user.email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }
  
  // Hash the password
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(user.password, saltRounds)
  
  // Create user object
  const userToAdd = {
    email: user.email,
    password: hashedPassword,
    userType: user.userType || 'regular',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const res = await collection.insertOne(userToAdd)
  userToAdd._id = res.insertedId
  
  // Don't return the password
  const { password, ...userWithoutPassword } = userToAdd
  return userWithoutPassword
}

async function update(userId, user) {
  const collection = await dbService.getCollection('users')
  const id = new ObjectId(userId)
  
  const updateData = {
    ...user,
    updatedAt: new Date()
  }
  
  // If password is being updated, hash it
  if (user.password) {
    const saltRounds = 10
    updateData.password = await bcrypt.hash(user.password, saltRounds)
  }
  
  delete updateData._id
  await collection.updateOne({ _id: id }, { $set: updateData })
  
  const updatedUser = await getById(userId)
  const { password, ...userWithoutPassword } = updatedUser
  return userWithoutPassword
}

async function remove(userId) {
  const collection = await dbService.getCollection('users')
  await collection.deleteOne({ _id: new ObjectId(userId) })
} 