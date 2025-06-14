"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Upload, Calendar, User, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

interface Document {
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "new":
      return "bg-blue-100 text-blue-800"
    case "active":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Lab Results":
      return "🧪"
    case "Treatment Plan":
      return "📋"
    case "Consultation":
      return "💬"
    case "Prescription":
      return "💊"
    default:
      return "📄"
  }
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState("")
  const [uploadType, setUploadType] = useState("")
  const [uploadDoctor, setUploadDoctor] = useState("")
  const [uploadDate, setUploadDate] = useState("")
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // View document state
  const [viewDocument, setViewDocument] = useState<Document | null>(null)
  const [viewOpen, setViewOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadFile(file)

      // Auto-fill name from filename if empty
      if (!uploadName) {
        setUploadName(file.name.split(".")[0])
      }

      // Set default date to today if empty
      if (!uploadDate) {
        setUploadDate(format(new Date(), "yyyy-MM-dd"))
      }
    }
  }

  const handleUploadSubmit = async () => {
    if (!user || !uploadFile) return

    // Validate required fields
    setValidationError(null)

    if (!uploadType) {
      setValidationError("Please select a document type")
      return
    }

    setUploading(true)
    setUploadStatus(null)

    try {
      // 1. Upload file to Supabase Storage
      const fileExt = uploadFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: fileData, error: fileError } = await supabase.storage.from("documents").upload(fileName, uploadFile)

      if (fileError) throw fileError

      // 2. Get public URL for the file
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)

      const fileUrl = urlData.publicUrl

      // 3. Create document record in database
      const { error: docError } = await supabase.from("documents").insert({
        user_id: user.id,
        name: uploadName,
        type: uploadType,
        date: uploadDate,
        doctor: uploadDoctor,
        status: "new",
        size: `${Math.round(uploadFile.size / 1024)} KB`,
        file_url: fileUrl,
        created_at: new Date().toISOString(),
      })

      if (docError) throw docError

      setUploadStatus({
        success: true,
        message: "Document uploaded successfully!",
      })

      // Refresh documents list
      fetchDocuments()

      // Reset form after successful upload
      setTimeout(() => {
        setUploadOpen(false)
        resetUploadForm()
      }, 2000)
    } catch (error: any) {
      console.error("Error uploading document:", error)
      setUploadStatus({
        success: false,
        message: `Error uploading document: ${error.message || "Please try again"}`,
      })
    } finally {
      setUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadFile(null)
    setUploadName("")
    setUploadType("")
    setUploadDoctor("")
    setUploadDate("")
    setUploadStatus(null)
    setValidationError(null)
  }

  const handleViewDocument = (document: Document) => {
    setViewDocument(document)
    setViewOpen(true)
  }

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_url) return

    // Open the file URL in a new tab
    window.open(document.file_url, "_blank")
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">Access your medical records, treatment plans, and reports.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-500">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📋</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter((doc) => doc.type === "Treatment Plan").length}
                </p>
                <p className="text-sm text-gray-500">Active Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">🧪</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter((doc) => doc.type === "Lab Results").length}
                </p>
                <p className="text-sm text-gray-500">Lab Results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">💊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter((doc) => doc.type === "Prescription").length}
                </p>
                <p className="text-sm text-gray-500">Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No documents found.</p>
              <p className="text-gray-400 text-sm">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{getTypeIcon(document.type)}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{document.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(document.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {document.doctor}
                        </div>
                        <span>{document.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(document.status)}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDocument(document)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        disabled={!document.file_url}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open)
          if (!open) resetUploadForm()
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload your medical documents, lab results, or treatment plans.</DialogDescription>
          </DialogHeader>

          {uploadStatus && (
            <Alert variant={uploadStatus.success ? "default" : "destructive"} className="mb-4">
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Document File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="flex-1"
                  required
                />
                {uploadFile && (
                  <Button variant="ghost" size="icon" onClick={() => setUploadFile(null)} className="h-10 w-10">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {uploadFile && (
                <p className="text-xs text-gray-500">
                  {uploadFile.name} ({Math.round(uploadFile.size / 1024)} KB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="mt-1"
                placeholder="e.g., Blood Test Results"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="flex items-center">
                  Document Type <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select value={uploadType} onValueChange={setUploadType} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab Results">Lab Results</SelectItem>
                    <SelectItem value="Treatment Plan">Treatment Plan</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Document Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="doctor">Doctor Name</Label>
              <Input
                id="doctor"
                value={uploadDoctor}
                onChange={(e) => setUploadDoctor(e.target.value)}
                className="mt-1"
                placeholder="e.g., Dr. Sarah Johnson"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={!uploadFile || !uploadName || !uploadDate || !uploadDoctor || uploading}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px] sm:h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewDocument?.name}</DialogTitle>
            <DialogDescription>
              <div>
                {viewDocument?.type} • {new Date(viewDocument?.date || "").toLocaleDateString()} •{" "}
                {viewDocument?.doctor}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {viewDocument?.file_url ? (
              <iframe src={viewDocument.file_url} className="w-full h-[50vh]" title={viewDocument.name} />
            ) : (
              <div className="flex items-center justify-center h-[50vh] bg-gray-100 rounded-md">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No preview available</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => viewDocument && handleDownloadDocument(viewDocument)}
              disabled={!viewDocument?.file_url}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
