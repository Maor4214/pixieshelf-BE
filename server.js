import dotenv from 'dotenv'
dotenv.config({ override: true })

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

// Import services after dotenv is configured
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
  /* ... */
})
app.post('/api/auth/signup', async (req, res) => {
  /* ... */
})
app.post('/api/auth/logout', (req, res) => {
  /* ... */
})

// PRODUCT ROUTES
app.get('/api/product', async (req, res) => {
  /* ... */
})
app.get(
  '/api/product/next-sku',
  authMiddleware.requireMember,
  async (req, res) => {
    /* ... */
  }
)
app.get('/api/product/:id', async (req, res) => {
  /* ... */
})
app.post('/api/product', authMiddleware.requireMember, async (req, res) => {
  /* ... */
})
app.put('/api/product/:id', authMiddleware.requireMember, async (req, res) => {
  /* ... */
})
app.delete(
  '/api/product/:id',
  authMiddleware.requireMember,
  async (req, res) => {
    /* ... */
  }
)

// USER ROUTES
app.post('/api/user', authMiddleware.requireAdmin, async (req, res) => {
  /* ... */
})
app.get('/api/user', authMiddleware.requireAdmin, async (req, res) => {
  /* ... */
})
app.get('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  /* ... */
})
app.put('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  /* ... */
})
app.delete('/api/user/:id', authMiddleware.requireAdmin, async (req, res) => {
  /* ... */
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
  // Dynamically import proxy middleware only in development
  const { createProxyMiddleware } = await import('http-proxy-middleware')

  app.use(
    '*',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message)
        res
          .status(500)
          .send('Proxy error: Vite dev server might not be running')
      },
    })
  )
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
