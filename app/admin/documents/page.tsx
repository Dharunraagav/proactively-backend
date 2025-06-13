"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Document {
  id: string
  name: string
  type: string
  date: string
  doctor: string
  status: string
  size: string
  file_url: string | null
  created_at: string
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [viewDocument, setViewDocument] = useState<Document | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("documents")
        .select(`
          id, name, type, date, doctor, status, size, file_url, created_at,
          user:profiles!user_id (id, first_name, last_name, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (document: Document) => {
    setViewDocument(document)
    setViewDialogOpen(true)
  }

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return

    try {
      // Delete the file from storage if it exists
      if (documentToDelete.file_url) {
        const filePathMatch = documentToDelete.file_url.match(/\/([^/]+)$/)
        if (filePathMatch && filePathMatch[1]) {
          const filePath = filePathMatch[1]
          await supabase.storage.from("documents").remove([filePath])
        }
      }

      // Delete the document record
      const { error } = await supabase.from("documents").delete().eq("id", documentToDelete.id)

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Document deleted successfully",
      })

      // Remove document from the list
      setDocuments(documents.filter((d) => d.id !== documentToDelete.id))
      setDeleteDialogOpen(false)

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error deleting document: ${error.message}`,
      })
    }
  }

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_url) return

    // Open the file URL in a new tab
    window.open(document.file_url, "_blank")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Lab Results":
        return "🧪"
      case "Treatment Plan":
        return "📋"
      default:
        return "📁"
    }
  }
}
