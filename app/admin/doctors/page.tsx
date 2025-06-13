"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, UserPlus, Edit, Trash2, Star, AlertCircle, ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface Consultant {
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

export default function DoctorsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editConsultant, setEditConsultant] = useState<Consultant | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [consultantToDelete, setConsultantToDelete] = useState<Consultant | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [newConsultantDialogOpen, setNewConsultantDialogOpen] = useState(false)
  const [newConsultant, setNewConsultant] = useState<Partial<Consultant>>({
    name: "",
    specialty: "",
    rating: 5.0,
    reviews: 0,
    location: "",
    image_url: "",
    next_available: "Tomorrow",
    price: "$150",
    badges: [],
  })

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("consultants").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setConsultants(data || [])
    } catch (error) {
      console.error("Error fetching consultants:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (consultant: Consultant) => {
    setEditConsultant({ ...consultant })
    setEditDialogOpen(true)
  }

  const handleDelete = (consultant: Consultant) => {
    setConsultantToDelete(consultant)
    setDeleteDialogOpen(true)
  }

  const handleUpdateConsultant = async () => {
    if (!editConsultant) return

    try {
      const { error } = await supabase
        .from("consultants")
        .update({
          name: editConsultant.name,
          specialty: editConsultant.specialty,
          rating: editConsultant.rating,
          reviews: editConsultant.reviews,
          location: editConsultant.location,
          image_url: editConsultant.image_url,
          next_available: editConsultant.next_available,
          price: editConsultant.price,
          badges: editConsultant.badges,
        })
        .eq("id", editConsultant.id)

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Doctor updated successfully",
      })

      // Update consultant in the list
      setConsultants(consultants.map((c) => (c.id === editConsultant.id ? editConsultant : c)))
      setEditDialogOpen(false)

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error updating doctor: ${error.message}`,
      })
    }
  }

  const handleDeleteConsultant = async () => {
    if (!consultantToDelete) return

    try {
      const { error } = await supabase.from("consultants").delete().eq("id", consultantToDelete.id)

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Doctor deleted successfully",
      })

      // Remove consultant from the list
      setConsultants(consultants.filter((c) => c.id !== consultantToDelete.id))
      setDeleteDialogOpen(false)

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error deleting doctor: ${error.message}`,
      })
    }
  }

  const handleCreateConsultant = async () => {
    try {
      // Convert badges from string to array if needed
      let badgesArray = newConsultant.badges
      if (typeof newConsultant.badges === "string") {
        badgesArray = (newConsultant.badges as string).split(",").map((b) => b.trim())
      }

      const { data, error } = await supabase
        .from("consultants")
        .insert({
          name: newConsultant.name,
          specialty: newConsultant.specialty,
          rating: newConsultant.rating || 5.0,
          reviews: newConsultant.reviews || 0,
          location: newConsultant.location,
          image_url: newConsultant.image_url,
          next_available: newConsultant.next_available || "Tomorrow",
          price: newConsultant.price || "$150",
          badges: badgesArray || [],
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Doctor created successfully",
      })

      // Add new consultant to the list
      if (data && data[0]) {
        setConsultants([data[0], ...consultants])
      }

      setNewConsultantDialogOpen(false)

      // Reset form
      setNewConsultant({
        name: "",
        specialty: "",
        rating: 5.0,
        reviews: 0,
        location: "",
        image_url: "",
        next_available: "Tomorrow",
        price: "$150",
        badges: [],
      })

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error creating doctor: ${error.message}`,
      })
    }
  }

  const filteredConsultants = consultants.filter((consultant) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      consultant.name.toLowerCase().includes(searchLower) ||
      consultant.specialty.toLowerCase().includes(searchLower) ||
      consultant.location.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctors Management</h1>
          <p className="text-gray-600">Manage all doctors and consultants in the system.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setNewConsultantDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Doctor
        </Button>
      </div>

      {statusMessage && (
        <Alert variant={statusMessage.type === "success" ? "default" : "destructive"} className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultants.length > 0 ? (
                filteredConsultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {consultant.image_url ? (
                            <Image
                              src={consultant.image_url || "/placeholder.svg"}
                              alt={consultant.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="font-medium">{consultant.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{consultant.specialty}</TableCell>
                    <TableCell>{consultant.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span>{consultant.rating}</span>
                        <span className="text-gray-400 text-xs ml-1">({consultant.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>{consultant.price}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(consultant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(consultant)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No doctors found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredConsultants.length}</span> of{" "}
              <span className="font-medium">{consultants.length}</span> doctors
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Make changes to the doctor's information below.</DialogDescription>
          </DialogHeader>

          {editConsultant && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editConsultant.name}
                    onChange={(e) => setEditConsultant({ ...editConsultant, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={editConsultant.specialty}
                    onChange={(e) => setEditConsultant({ ...editConsultant, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editConsultant.location}
                    onChange={(e) => setEditConsultant({ ...editConsultant, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={editConsultant.price}
                    onChange={(e) => setEditConsultant({ ...editConsultant, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editConsultant.rating}
                    onChange={(e) =>
                      setEditConsultant({ ...editConsultant, rating: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reviews">Reviews Count</Label>
                  <Input
                    id="reviews"
                    type="number"
                    min="0"
                    value={editConsultant.reviews}
                    onChange={(e) => setEditConsultant({ ...editConsultant, reviews: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={editConsultant.image_url || ""}
                  onChange={(e) => setEditConsultant({ ...editConsultant, image_url: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="next_available">Next Available</Label>
                <Input
                  id="next_available"
                  value={editConsultant.next_available}
                  onChange={(e) => setEditConsultant({ ...editConsultant, next_available: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="badges">Badges (comma separated)</Label>
                <Input
                  id="badges"
                  value={Array.isArray(editConsultant.badges) ? editConsultant.badges.join(", ") : ""}
                  onChange={(e) =>
                    setEditConsultant({
                      ...editConsultant,
                      badges: e.target.value.split(",").map((b) => b.trim()),
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConsultant}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {consultantToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
                <p className="font-medium text-red-800">You are about to delete:</p>
                <p className="text-red-700">
                  {consultantToDelete.name} ({consultantToDelete.specialty})
                </p>
              </div>

              <p className="text-gray-500 text-sm">
                This will permanently delete the doctor's profile and all associated appointments.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConsultant}>
              Delete Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Doctor Dialog */}
      <Dialog open={newConsultantDialogOpen} onOpenChange={setNewConsultantDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>Enter the details for the new doctor.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={newConsultant.name}
                  onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-specialty">Specialty</Label>
                <Input
                  id="new-specialty"
                  value={newConsultant.specialty}
                  onChange={(e) => setNewConsultant({ ...newConsultant, specialty: e.target.value })}
                  placeholder="Lifestyle Medicine"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-location">Location</Label>
                <Input
                  id="new-location"
                  value={newConsultant.location}
                  onChange={(e) => setNewConsultant({ ...newConsultant, location: e.target.value })}
                  placeholder="New York, NY"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-price">Price</Label>
                <Input
                  id="new-price"
                  value={newConsultant.price}
                  onChange={(e) => setNewConsultant({ ...newConsultant, price: e.target.value })}
                  placeholder="$150"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-image_url">Image URL</Label>
              <Input
                id="new-image_url"
                value={newConsultant.image_url || ""}
                onChange={(e) => setNewConsultant({ ...newConsultant, image_url: e.target.value })}
                placeholder="https://example.com/doctor-image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="new-next_available">Next Available</Label>
              <Input
                id="new-next_available"
                value={newConsultant.next_available}
                onChange={(e) => setNewConsultant({ ...newConsultant, next_available: e.target.value })}
                placeholder="Tomorrow 2:00 PM"
                required
              />
            </div>

            <div>
              <Label htmlFor="new-badges">Badges (comma separated)</Label>
              <Input
                id="new-badges"
                value={Array.isArray(newConsultant.badges) ? newConsultant.badges.join(", ") : ""}
                onChange={(e) =>
                  setNewConsultant({
                    ...newConsultant,
                    badges: e.target.value.split(",").map((b) => b.trim()),
                  })
                }
                placeholder="Board Certified, Diabetes Specialist"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewConsultantDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConsultant}
              disabled={!newConsultant.name || !newConsultant.specialty || !newConsultant.location}
            >
              Create Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
