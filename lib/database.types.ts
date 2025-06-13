export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          height: number | null
          weight: number | null
          blood_type: string | null
          emergency_contact: string | null
          allergies: string | null
          medications: string | null
          user_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          blood_type?: string | null
          emergency_contact?: string | null
          allergies?: string | null
          medications?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          blood_type?: string | null
          emergency_contact?: string | null
          allergies?: string | null
          medications?: string | null
          user_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      consultants: {
        Row: {
          id: string
          name: string
          specialty: string
          rating: number
          reviews: number
          location: string
          image_url: string | null
          next_available: string
          price: string
          badges: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          specialty: string
          rating?: number
          reviews?: number
          location: string
          image_url?: string | null
          next_available: string
          price: string
          badges?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          specialty?: string
          rating?: number
          reviews?: number
          location?: string
          image_url?: string | null
          next_available?: string
          price?: string
          badges?: string[]
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          date: string
          doctor: string
          status: string
          size: string
          file_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          date: string
          doctor: string
          status?: string
          size: string
          file_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          date?: string
          doctor?: string
          status?: string
          size?: string
          file_url?: string | null
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          consultant_id: string
          date: string
          time: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consultant_id: string
          date: string
          time: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consultant_id?: string
          date?: string
          time?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
