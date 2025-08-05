import { dbService } from './db.service.js'
import { ObjectId } from 'mongodb'

export const productService = {
  query,
  getById,
  add,
  update,
  remove,
  generateNextSKU,
}

async function query(filterBy = {}) {
  const criteria = {}
  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: 'i' }
  }
  const collection = await dbService.getCollection('products')
  return await collection.find(criteria).toArray()
}

async function getById(productId) {
  const collection = await dbService.getCollection('products')
  return await collection.findOne({ _id: new ObjectId(productId) })
}

async function generateNextSKU() {
  const collection = await dbService.getCollection('products')
  
  // Find the product with the highest SKU number
  const highestProduct = await collection.findOne(
    { sku: { $regex: /^CCM-\d+$/ } },
    { sort: { sku: -1 } }
  )
  
  let nextNumber = 1
  
  if (highestProduct) {
    // Extract the number from the highest SKU (e.g., "CCM-015" -> 15)
    const match = highestProduct.sku.match(/^CCM-(\d+)$/)
    if (match) {
      nextNumber = parseInt(match[1]) + 1
    }
  }
  
  // Format as "CCM-XXX" with leading zeros
  return `CCM-${nextNumber.toString().padStart(3, '0')}`
}

async function add(product) {
  const collection = await dbService.getCollection('products')
  
  // Generate the next SKU if not provided
  if (!product.sku) {
    product.sku = await generateNextSKU()
  }
  
  // Set creation date for new products
  product.createdAt = new Date()
  product.marketDate = new Date()
  product.isEdited = false
  
  const res = await collection.insertOne(product)
  product._id = res.insertedId
  return product
}

async function update(productId, product) {
  const collection = await dbService.getCollection('products')
  const id = new ObjectId(productId)
  delete product._id
  
  // Set marketDate to current date when editing and mark as edited
  product.marketDate = new Date()
  product.isEdited = true
  
  await collection.updateOne({ _id: id }, { $set: product })
  product._id = id
  return product
}

async function remove(productId) {
  const collection = await dbService.getCollection('products')
  await collection.deleteOne({ _id: new ObjectId(productId) })
}
