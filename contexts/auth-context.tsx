"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Create or update profile if user exists
      if (session?.user) {
        createOrUpdateProfile(session.user)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // If user signs up or signs in, create or update their profile
      if (session?.user && (event === "SIGNED_IN" || event === "SIGNED_UP" || event === "TOKEN_REFRESHED")) {
        await createOrUpdateProfile(session.user)

        // Redirect to dashboard after sign in
        router.push("/dashboard")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const createOrUpdateProfile = async (user: User) => {
    try {
      console.log("Creating/updating profile for user:", user.id)

      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching profile:", fetchError)
      }

      if (!existingProfile) {
        console.log("No existing profile, creating new one")
        // Create new profile with direct insert
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          user_type: "patient", // Default to patient
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating profile:", error)
        }
      } else {
        console.log("Updating existing profile")
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            email: user.email,
            first_name: user.user_metadata?.first_name || existingProfile.first_name,
            last_name: user.user_metadata?.last_name || existingProfile.last_name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          console.error("Error updating profile:", error)
        }
      }
    } catch (error) {
      console.error("Error in createOrUpdateProfile:", error)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      // First, just create the auth user without trying to create a profile
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + "/dashboard",
        },
      })

      if (error) {
        console.error("Signup error:", error)
        return { data, error }
      }

      console.log("User signed up successfully:", data)

      // Return success - we'll create the profile when the user is confirmed via onAuthStateChange
      return { data, error: null }
    } catch (error: any) {
      console.error("Unexpected signup error:", error)
      return {
        data: null,
        error: {
          message: error.message || "An unexpected error occurred during signup",
        },
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
      } else {
        console.log("User signed in successfully")
      }

      return { data, error }
    } catch (error: any) {
      console.error("Unexpected sign in error:", error)
      return {
        data: null,
        error: {
          message: error.message || "An unexpected error occurred during sign in",
        },
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
