import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { rateLimit, trackSession, getActiveSessions } from '@/lib/rate-limiter'

// Rate limiting middleware - 100 requests per 15 minutes per IP
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts, please try again later'
})

// Maximum concurrent sessions per user
const MAX_CONCURRENT_SESSIONS = 3

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Apply rate limiting
  try {
    await new Promise((resolve, reject) => {
      loginRateLimit(req, res, (error?: Error) => {
        if (error) reject(error)
        else resolve(true)
      })
    })
  } catch (error) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Check if user exists and get their ID
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError) {
      console.error('Error checking user:', userError)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check concurrent sessions
    if (user) {
      const activeSessions = getActiveSessions(user.id)
      if (activeSessions >= MAX_CONCURRENT_SESSIONS) {
        return res.status(429).json({
          error: 'Maximum number of concurrent sessions reached. Please sign out from other devices.'
        })
      }
    }

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Login error:', error)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Track the new session
    if (data.session) {
      trackSession(data.user.id, data.session.access_token)
    }

    // Return success with session
    return res.status(200).json({
      user: data.user,
      session: data.session
    })

  } catch (error) {
    console.error('Unexpected error during login:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
}
