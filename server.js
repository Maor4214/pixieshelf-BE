import dotenv from 'dotenv'
dotenv.config({ override: true })

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

import { productService } from './services/product.service.js'
import { userService } from './services/user.service.js'
import { authMiddleware } from './middleware/auth.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  app.use(express.static(path.join(__dirname, 'public')))
}

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Missing email or password' })

    const user = await userService.getByEmail(email)
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' })

    const bcrypt = await import('bcrypt')
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword)
      return res.status(401).json({ error: 'Invalid email or password' })

    const token = authMiddleware.generateToken(user._id.toString())
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword, token })
  } catch (err) {
    res.status(500).json({ error: 'Login failed' })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, userType = 'regular' } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Missing email or password' })

    const newUser = await userService.add({ email, password, userType })
    const token = authMiddleware.generateToken(newUser._id.toString())

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })

    res.status(201).json({ user: newUser, token })
  } catch (err) {
    if (err.message === 'User with this email already exists') {
      res.status(409).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Signup failed' })
    }
  }
})

app.post('/api/auth/logout', (req, res) => {
  const token =
    req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '')
  if (token) authMiddleware.removeToken(token)

  res.clearCookie('authToken')
  res.json({ message: 'Logged out successfully' })
})

// PRODUCT ROUTES
app.get('/api/product', async (req, res) => {
  try {
    const products = await productService.query()
    res.send(products)
  } catch (err) {
    res.status(500).send('Failed to get products')
  }
})

app.get(
  '/api/product/next-sku',
  authMiddleware.requireMember,
  async (req, res) => {
    try {
      const nextSKU = await productService.generateNextSKU()
      res.send({ nextSKU })
    } catch (err) {
      res.status(500).send('Failed to generate next SKU')
    }
  }
)

app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await productService.getById(req.params.id)
    if (!product) return res.status(404).send('Product not found')
    res.send(product)
  } catch (err) {
    res.status(500).send('Failed to get product')
  }
})

app.post('/api/product', authMiddleware.requireMember, async (req, res) => {
  try {
    const newProduct = await productService.add(req.body)
    res.status(201).send(newProduct)
  } catch (err) {
    res.status(500).send('Failed to create product')
  }
})

app.put('/api/product/:id', authMiddleware.requireMember, async (req, res) => {
  try {
    const updatedProduct = await productService.update(req.params.id, req.body)
    res.send(updatedProduct)
  } catch (err) {
    res.status(500).send('Failed to update product')
  }
})

app.delete(
  '/api/product/:id',
  authMiddleware.requireMember,
  async (req, res) => {
    try {
      await productService.remove(req.params.id)
      res.send('Product deleted')
    } catch (err) {
      res.status(500).send('Failed to delete product')
    }
  }
)

// USER ROUTES
app.post('/api/user', authMiddleware.requireAdmin, async (req, res) => {
  try {
    const { email, password, userType } = req.body
    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: email, password, userType' })
    }

    if (!['admin', 'regular'].includes(userType)) {
      return res
        .status(400)
        .json({ error: 'Invalid user type. Must be "admin" or "regular"' })
    }

    const newUser = await userService.add({ email, password, userType })
    res.status(201).send(newUser)
  } catch (err) {
    console.error('❌ Error creating user:', err)
    if (err.message === 'User with this email already exists') {
      res.status(409).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Failed to create user: ' + err.message })
    }
  }
})

app.get('/api/user', authMiddleware.requireAdmin, async (req, res) => {
  try {
    const users = await userService.query()
    res.send(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to get users' })
  }
})

app.get('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  try {
    const user = await userService.getById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.send(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' })
  }
})

app.put('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  try {
    const updatedUser = await userService.update(req.params.id, req.body)
    res.send(updatedUser)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

app.delete('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  try {
    await userService.remove(req.params.id)
    res.send('User deleted')
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

// Home route
app.get('/api', (req, res) => {
  res.send('Welcome to the Product Management API!')
})

// SPA CATCH-ALL (Production only)
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })
} else {
  const proxyDev = await import('./proxy.dev.js')
  proxyDev.setupProxy(app)
}

// Debugging all registered routes
app._router.stack
  .filter((r) => r.route)
  .forEach((r) => {
    console.log(
      'Registered route:',
      Object.keys(r.route.methods)[0].toUpperCase(),
      r.route.path
    )
  })

// Start server
const port = process.env.PORT || 3035
server.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}/`)
  if (!isProduction) {
    console.log(
      `🔄 Proxy configured to forward non-API routes to Vite dev server (http://localhost:5173)`
    )
  }
})
