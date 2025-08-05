import jwt from 'jsonwebtoken'
import { userService } from '../services/user.service.js'

// Simple token management (in production, use proper JWT)
const tokens = new Map()

export const authMiddleware = {
  // Generate a simple token for user
  generateToken: (userId) => {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
    tokens.set(token, userId)
    console.log(`🔑 Generated token for user ${userId}:`, token)
    console.log(`📊 Current tokens in memory:`, tokens.size)
    return token
  },

  // Verify token and get user
  verifyToken: (token) => {
    const userId = tokens.get(token)
    console.log(`🔍 Verifying token:`, token)
    console.log(`👤 Found userId:`, userId)
    return userId
  },

  // Remove token on logout
  removeToken: (token) => {
    tokens.delete(token)
    console.log(`🗑️ Removed token:`, token)
  },

  // Authentication middleware
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.authToken

    console.log(`🔐 Auth check - Token:`, token)
    console.log(`🔐 Auth check - Headers:`, req.headers.authorization)

    if (!token) {
      console.log(`❌ No token provided`)
      return res.status(401).json({ 
        error: 'Authentication required',
        redirect: '/login'
      })
    }

    const userId = authMiddleware.verifyToken(token)
    if (!userId) {
      console.log(`❌ Invalid token:`, token)
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        redirect: '/login'
      })
    }

    console.log(`✅ Valid token for user:`, userId)
    req.userId = userId
    next()
  },

  // Authorization middleware for different user types
  requireAuth: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.authToken

    if (!token) {
      return res.status(401).json({ 
        error: 'You must be logged in to access this resource',
        redirect: '/login'
      })
    }

    const userId = authMiddleware.verifyToken(token)
    if (!userId) {
      return res.status(401).json({ 
        error: 'Invalid or expired session',
        redirect: '/login'
      })
    }

    req.userId = userId
    next()
  },

  // Require admin access
  requireAdmin: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                    req.cookies?.authToken

      console.log(`👑 Admin check - Token:`, token)
      console.log(`👑 Admin check - Headers:`, req.headers.authorization)

      if (!token) {
        console.log(`❌ No token for admin check`)
        return res.status(401).json({ 
          error: 'Authentication required',
          redirect: '/login'
        })
      }

      const userId = authMiddleware.verifyToken(token)
      if (!userId) {
        console.log(`❌ Invalid token for admin check:`, token)
        return res.status(401).json({ 
          error: 'Invalid or expired session',
          redirect: '/login'
        })
      }

      // Get user from database to check role
      const user = await userService.getById(userId)
      
      console.log(`👤 Found user for admin check:`, user)
      
      if (!user) {
        console.log(`❌ User not found for admin check:`, userId)
        return res.status(401).json({ 
          error: 'User not found',
          redirect: '/login'
        })
      }

      if (user.userType !== 'admin') {
        console.log(`❌ User is not admin:`, user.userType)
        return res.status(403).json({ 
          error: 'Admin access required',
          redirect: '/products'
        })
      }

      console.log(`✅ Admin access granted for:`, user.email)
      req.user = user
      req.userId = userId
      next()
    } catch (err) {
      console.error(`❌ Admin check error:`, err)
      return res.status(500).json({ 
        error: 'Authorization check failed',
        redirect: '/login'
      })
    }
  },

  // Require logged in user (member or admin)
  requireMember: async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || 
                    req.cookies?.authToken

      if (!token) {
        return res.status(401).json({ 
          error: 'You must be logged in to access this resource',
          redirect: '/login'
        })
      }

      const userId = authMiddleware.verifyToken(token)
      if (!userId) {
        return res.status(401).json({ 
          error: 'Invalid or expired session',
          redirect: '/login'
        })
      }

      // Get user from database to check role
      const user = await userService.getById(userId)
      
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          redirect: '/login'
        })
      }

      if (user.userType !== 'admin' && user.userType !== 'regular') {
        return res.status(403).json({ 
          error: 'Member or admin access required',
          redirect: '/products'
        })
      }

      req.user = user
      req.userId = userId
      next()
    } catch (err) {
      return res.status(500).json({ 
        error: 'Authorization check failed',
        redirect: '/login'
      })
    }
  }
} 