import { dbService } from './db.service.js'
import { ObjectId } from 'mongodb'

export const productService = {
  query,
  getById,
  add,
  update,
  remove,
}

async function query(filterBy = {}) {
  const criteria = {}
  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: 'i' }
  }
  const collection = await dbService.getCollection('product')
  return await collection.find(criteria).toArray()
}

async function getById(productId) {
  const collection = await dbService.getCollection('product')
  return await collection.findOne({ _id: new ObjectId(productId) })
}

async function add(product) {
  const collection = await dbService.getCollection('product')
  const res = await collection.insertOne(product)
  product._id = res.insertedId
  return product
}

async function update(productId, product) {
  const collection = await dbService.getCollection('product')
  const id = new ObjectId(productId)
  delete product._id
  await collection.updateOne({ _id: id }, { $set: product })
  product._id = id
  return product
}

async function remove(productId) {
  const collection = await dbService.getCollection('product')
  await collection.deleteOne({ _id: new ObjectId(productId) })
}
