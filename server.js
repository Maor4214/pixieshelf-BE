// server.js (With Service Layer for Product Management)

import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import path from 'path'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { productService } from './services/product.service.js'

const app = express()
const server = http.createServer(app)
const isProduction = process.env.NODE_ENV === 'production'

// Middlewares
app.use(cookieParser())
app.use(express.json())

// CORS
if (!isProduction) {
  const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  }
  app.use(cors(corsOptions))
} else {
  app.use(express.static(path.resolve('public')))
}

// ALS Middleware
app.all('/*', setupAsyncLocalStorage)

// Auth Routes 
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body
  if (!username) return res.status(400).send('Missing username')
  res.send({ _id: 'u1', username, fullname: 'Test User' })
})

app.post('/api/auth/signup', (req, res) => {
  const { username, fullname } = req.body
  if (!username || !fullname) return res.status(400).send('Missing fields')
  res.send({ _id: 'u2', username, fullname })
})

app.post('/api/auth/logout', (req, res) => {
  res.send('Logged out')
})

// Product Routes
app.get('/api/product', async (req, res) => {
  try {
    const products = await productService.query()
    res.send(products)
  } catch (err) {
    res.status(500).send('Failed to get products')
  }
})

app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await productService.getById(req.params.id)
    if (!product) return res.status(404).send('Product not found')
    res.send(product)
  } catch (err) {
    res.status(500).send('Failed to get product')
  }
})

app.post('/api/product', async (req, res) => {
  try {
    const newProduct = await productService.add(req.body)
    res.status(201).send(newProduct)
  } catch (err) {
    res.status(500).send('Failed to create product')
  }
})

app.put('/api/product/:id', async (req, res) => {
  try {
    const updatedProduct = await productService.update(req.params.id, req.body)
    res.send(updatedProduct)
  } catch (err) {
    res.status(500).send('Failed to update product')
  }
})

app.delete('/api/product/:id', async (req, res) => {
  try {
    await productService.remove(req.params.id)
    res.send('Product deleted')
  } catch (err) {
    res.status(500).send('Failed to delete product')
  }
})

// Home route
app.get('/api', (req, res) => {
  res.send('Welcome to the Product Management API!')
})

// Catch-all for SPA routing
app.get('/*', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

// Start server
const port = process.env.PORT || 3031
server.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}/`)
})
