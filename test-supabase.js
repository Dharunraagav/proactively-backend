// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')

// Your provided credentials
const supabaseUrl = 'https://jpyeadgeacgysrfecfpo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpweWVhZGdlYWNneXNyZmVjZnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDUzODksImV4cCI6MjA2NTMyMTM4OX0.xiZb7o2OVTGGEZpVk576X1qZ5fjgUfOARgiFPsOWjGY'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key length:', supabaseKey.length)

const supabase = createClient(supabaseUrl, supabaseKey)

// Test basic connection
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Connection error:', error)
    } else {
      console.log('Connection successful!')
      console.log('Session data:', data)
    }
  } catch (err) {
    console.error('Test failed:', err)
  }
}

testConnection()
