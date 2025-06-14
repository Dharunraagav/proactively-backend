import { NextApiRequest, NextApiResponse } from 'next'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(options: {
  windowMs: number
  max: number
  message?: string
}) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
    const key = `${ip}-${req.url}`
    const now = Date.now()
    
    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
    
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      }
    } else if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      }
    } else {
      store[key].count++
    }
    
    if (store[key].count > options.max) {
      return res.status(429).json({
        error: options.message || 'Too many requests'
      })
    }
    
    next()
  }
}

// Session tracking for concurrent login prevention
interface SessionStore {
  [userId: string]: {
    sessionIds: Set<string>
    lastActivity: number
  }
}

const sessionStore: SessionStore = {}

export function trackSession(userId: string, sessionId: string) {
  if (!sessionStore[userId]) {
    sessionStore[userId] = {
      sessionIds: new Set(),
      lastActivity: Date.now()
    }
  }
  
  sessionStore[userId].sessionIds.add(sessionId)
  sessionStore[userId].lastActivity = Date.now()
}

export function removeSession(userId: string, sessionId: string) {
  if (sessionStore[userId]) {
    sessionStore[userId].sessionIds.delete(sessionId)
    if (sessionStore[userId].sessionIds.size === 0) {
      delete sessionStore[userId]
    }
  }
}

export function getActiveSessions(userId: string): number {
  return sessionStore[userId]?.sessionIds.size || 0
}

export function cleanupInactiveSessions() {
  const now = Date.now()
  const timeout = 30 * 60 * 1000 // 30 minutes
  
  Object.keys(sessionStore).forEach(userId => {
    if (now - sessionStore[userId].lastActivity > timeout) {
      delete sessionStore[userId]
    }
  })
}

// Run cleanup every 5 minutes
setInterval(cleanupInactiveSessions, 5 * 60 * 1000)
