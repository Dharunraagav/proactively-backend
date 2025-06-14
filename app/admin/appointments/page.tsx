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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  created_at: string
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  }
  consultant: {
    id: string
    name: string
    specialty: string
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id, date, time, status, notes, created_at,
          user:profiles!user_id (id, first_name, last_name, email),
          consultant:consultants!consultant_id (id, name, specialty)
        `)
        .order("date", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (appointment: Appointment) => {
    setEditAppointment({ ...appointment })
    setEditDialogOpen(true)
  }

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment)
    setDeleteDialogOpen(true)
  }

  const handleUpdateAppointment = async () => {
    if (!editAppointment) return

    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          date: editAppointment.date,
          time: editAppointment.time,
          status: editAppointment.status,
          notes: editAppointment.notes,
        })
        .eq("id", editAppointment.id)

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Appointment updated successfully",
      })

      // Update appointment in the list
      setAppointments(appointments.map((a) => (a.id === editAppointment.id ? editAppointment : a)))
      setEditDialogOpen(false)

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error updating appointment: ${error.message}`,
      })
    }
  }

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return

    try {
      const { error } = await supabase.from("appointments").delete().eq("id", appointmentToDelete.id)

      if (error) throw error

      setStatusMessage({
        type: "success",
        message: "Appointment deleted successfully",
      })

      // Remove appointment from the list
      setAppointments(appointments.filter((a) => a.id !== appointmentToDelete.id))
      setDeleteDialogOpen(false)

      // Clear status message after 3 seconds
      setTimeout(() => setStatusMessage(null), 3000)
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: `Error deleting appointment: ${error.message}`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "rescheduled":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Rescheduled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      appointment.user.first_name?.toLowerCase().includes(searchLower) ||
      appointment.user.last_name?.toLowerCase().includes(searchLower) ||
      appointment.user.email.toLowerCase().includes(searchLower) ||
      appointment.consultant.name.toLowerCase().includes(searchLower) ||
      new Date(appointment.date).toLocaleDateString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || appointment.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments Management</h1>
          <p className="text-gray-600">Manage all appointments in the system.</p>
        </div>
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
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {appointment.user.first_name} {appointment.user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.consultant.name}</p>
                        <p className="text-sm text-gray-500">{appointment.consultant.specialty}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{new Date(appointment.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>{new Date(appointment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditAppointment({ ...appointment, status: "completed" })
                              handleUpdateAppointment()
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditAppointment({ ...appointment, status: "cancelled" })
                              handleUpdateAppointment()
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Mark Cancelled
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(appointment)}
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
                    No appointments found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredAppointments.length}</span> of{" "}
              <span className="font-medium">{appointments.length}</span> appointments
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

      {/* Edit Appointment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Make changes to the appointment details below.</DialogDescription>
          </DialogHeader>

          {editAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editAppointment.date}
                    onChange={(e) => setEditAppointment({ ...editAppointment, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={editAppointment.time}
                    onChange={(e) => setEditAppointment({ ...editAppointment, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editAppointment.status}
                  onValueChange={(value) => setEditAppointment({ ...editAppointment, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={editAppointment.notes || ""}
                  onChange={(e) => setEditAppointment({ ...editAppointment, notes: e.target.value })}
                  placeholder="Add any notes about this appointment"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Appointment Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {appointmentToDelete && (
            <div className="py-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
                <p className="font-medium text-red-800">You are about to delete:</p>
                <p className="text-red-700">
                  Appointment for {appointmentToDelete.user.first_name} {appointmentToDelete.user.last_name} with{" "}
                  {appointmentToDelete.consultant.name}
                </p>
                <p className="text-red-700">
                  on {new Date(appointmentToDelete.date).toLocaleDateString()} at {appointmentToDelete.time}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAppointment}>
              Delete Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
