import jwt from 'jsonwebtoken'
import { userService } from '../services/user.service.js'

// Simple token management (in production, use proper JWT)
const tokens = new Map()

export const authMiddleware = {
  // Generate a simple token for user
  generateToken: (userId) => {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
    tokens.set(token, userId)
    return token
  },

  // Verify token and get user
  verifyToken: (token) => {
    const userId = tokens.get(token)
    return userId
  },

  // Remove token on logout
  removeToken: (token) => {
    tokens.delete(token)
  },

  // Authentication middleware
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies?.authToken

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        redirect: '/login'
      })
    }

    const userId = authMiddleware.verifyToken(token)
    if (!userId) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        redirect: '/login'
      })
    }

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

      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication required',
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

      if (user.userType !== 'admin') {
        return res.status(403).json({ 
          error: 'Admin access required',
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