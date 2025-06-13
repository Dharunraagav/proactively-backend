import { createClient } from "@supabase/supabase-js"

// This is a safe way to check if we're on the server
const isServer = typeof window === "undefined"

// Create a dummy client for server-side rendering
const dummyClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not available during SSR" } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not available during SSR" } }),
    signOut: () => Promise.resolve({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      remove: () => Promise.resolve({ data: null, error: null }),
    }),
  },
}

// Only initialize the real client in the browser
let supabaseInstance = isServer ? dummyClient : null

// Function to get the Supabase client
export function getSupabaseClient() {
  // If we're on the server, return the dummy client
  if (isServer) {
    return dummyClient
  }

  // Only create the client if we're in a browser environment and it doesn't already exist
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase URL or key is missing")
      return dummyClient
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// For backward compatibility - will be the dummy client on the server
export const supabase = getSupabaseClient()
