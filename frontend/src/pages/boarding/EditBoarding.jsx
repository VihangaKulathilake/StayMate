import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "@/components/common/AdminNavbar";
import Sidebar from "@/components/common/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin, Wifi, Wind, Car, Shield, Coffee, Check, BookOpen, Bath, Shirt, Droplets, DoorOpen, Bus, VolumeX, AlertTriangle } from "lucide-react";
import { getBoardingById, updateBoarding, deleteBoarding } from "@/api/boardings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MapPicker from "@/components/common/MapPicker";
import ImageUpload from "@/components/common/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROPERTY_FACILITIES = [
  { name: "Parking Space", icon: Car },
  { name: "CCTV / Security", icon: Shield },
  { name: "Filtered Water", icon: Droplets },
  { name: "Laundry / Shared Ironing", icon: Shirt },
  { name: "Near Bus Route", icon: Bus },
  { name: "Quiet Environment", icon: VolumeX },
];

const ROOM_FACILITIES = [
  { name: "Air Conditioning", icon: Wind },
  { name: "Free WiFi", icon: Wifi },
  { name: "Attached Bathroom", icon: Bath },
  { name: "Private Kitchen", icon: Coffee },
  { name: "Study Desks", icon: BookOpen },
  { name: "Separate Entrance", icon: DoorOpen },
];

const AVAILABLE_FACILITIES = [...PROPERTY_FACILITIES, ...ROOM_FACILITIES];

export default function EditBoarding() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [form, setForm] = useState({
    boardingName: "",
    address: "",
    city: "",
    type: "room_based",
    totalRooms: "",
    price: "",
    description: "",
    latitude: "",
    longitude: "",
    facilities: [],
    images: [],
    rooms: [], // Existing rooms for room_based
  });

  React.useEffect(() => {
    fetchBoarding();
  }, [id]);

  const fetchBoarding = async () => {
    try {
      setFetchLoading(true);
      const data = await getBoardingById(id);
      setForm({
        boardingName: data.boardingName,
        address: data.address,
        city: data.city || "",
        type: data.type,
        totalRooms: data.totalRooms?.toString(),
        price: data.price?.toString(),
        description: data.description,
        latitude: data.location?.coordinates[1]?.toString() || "",
        longitude: data.location?.coordinates[0]?.toString() || "",
        facilities: data.facilities || [],
        images: data.images || [],
        rooms: data.rooms || [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFetchLoading(false);
    }
  };

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onSelectChange = (val) => setForm(p => ({ ...p, type: val }));
  const onLocationSelect = React.useCallback(({ lat, lng }) => setForm(p => ({ ...p, latitude: lat, longitude: lng })), []);
  
  const addRoom = () => {
    setForm(p => ({
      ...p,
      rooms: [...(p.rooms || []), { roomNumber: "", description: "", price: "", capacity: 1, images: [], facilities: [] }]
    }));
  };

  const removeRoom = (index) => {
    setForm(p => ({
      ...p,
      rooms: p.rooms.filter((_, i) => i !== index)
    }));
  };

  const onRoomChange = (index, field, value) => {
    setForm(p => {
      const newRooms = [...p.rooms];
      newRooms[index] = { ...newRooms[index], [field]: value };
      return { ...p, rooms: newRooms };
    });
  };

  const toggleFacility = (facilityName) => {
    setForm(p => {
      const facilities = p.facilities || [];
      const exists = facilities.includes(facilityName);
      if (exists) {
        return { ...p, facilities: facilities.filter(f => f !== facilityName) };
      }
      return { ...p, facilities: [...facilities, facilityName] };
    });
  };

  const toggleRoomFacility = (index, facilityName) => {
    setForm(p => {
      const newRooms = [...p.rooms];
      const room = newRooms[index];
      const facilities = room.facilities || [];
      const exists = facilities.includes(facilityName);
      
      if (exists) {
        newRooms[index] = { ...room, facilities: facilities.filter(f => f !== facilityName) };
      } else {
        newRooms[index] = { ...room, facilities: [...facilities, facilityName] };
      }
      
      return { ...p, rooms: newRooms };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setSubmitError("");
      const submitData = {
        ...form,
        location: {
          type: "Point",
          coordinates: [Number(form.longitude), Number(form.latitude)],
        },
      };

      if (form.type === "room_based") {
        delete submitData.price;
        delete submitData.totalRooms;
      } else {
        delete submitData.rooms;
      }
      await updateBoarding(id, submitData);
      navigate("/boardings");
    } catch (error) {
      console.error(error);
      setSubmitError(error.message || "Failed to update boarding.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError("");
      await deleteBoarding(id);
      setIsDeleteDialogOpen(false);
      navigate("/boardings");
    } catch (error) {
      console.error("Failed to delete property:", error);
      setDeleteError(error.message || "Failed to delete boarding.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (fetchLoading) return <div className="p-12 text-center text-slate-400 font-black">Loading property details for audit...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 space-y-6">
          <Card className="max-w-3xl rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-3xl font-black tracking-tight">Edit Boarding</CardTitle>
              <p className="text-xs uppercase tracking-wider font-black text-slate-400">Property ID: {id}</p>
            </CardHeader>
            <CardContent>
              {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold space-y-1">
                  <p className="font-black uppercase tracking-wider text-[10px] text-rose-500">Update Failed</p>
                  <p>{submitError}</p>
                </div>
              )}
              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="boardingName">Boarding Name</Label>
                  <Input id="boardingName" name="boardingName" value={form.boardingName} onChange={onChange} required />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={form.address} onChange={onChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={form.city} onChange={onChange} required />
                  </div>
                </div>
                <div className="space-y-4 pt-2">
                  <Label>Asset Location</Label>
                  {form.latitude && form.longitude && (
                    <MapPicker 
                      initialPosition={{ lat: Number(form.latitude), lng: Number(form.longitude) }} 
                      onLocationSelect={onLocationSelect} 
                    />
                  )}
                  {!form.latitude && !form.longitude && (
                    <MapPicker onLocationSelect={onLocationSelect} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Listing Type</Label>
                  <Select value={form.type} onValueChange={onSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room_based">Room Based (Individual Rents)</SelectItem>
                      <SelectItem value="full_property">Full Property (Single Unit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                  {form.type === 'full_property' ? (
                    <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <Label htmlFor="totalRooms" className="font-bold text-slate-700">Total Rooms</Label>
                        <Input id="totalRooms" name="totalRooms" type="number" min="1" className="h-12 rounded-xl" value={form.totalRooms} onChange={onChange} required />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="price" className="font-bold text-slate-700">Monthly Rent (LKR)</Label>
                        <Input id="price" name="price" type="number" min="0" className="h-12 rounded-xl" value={form.price} onChange={onChange} required />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center justify-between">
                         <Label className="font-black text-xs uppercase tracking-widest text-indigo-600">Room Inventory Matrix</Label>
                         <Button type="button" onClick={addRoom} variant="outline" className="h-10 px-4 rounded-xl font-bold bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50 flex items-center gap-2 shadow-sm">
                           <Plus className="w-4 h-4" /> Add Room
                         </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {form.rooms?.map((room, index) => (
                          <div key={index} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm relative group space-y-6">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                                   {index + 1}
                                 </div>
                                 <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Room Specification</h4>
                               </div>
                               {form.rooms.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeRoom(index)}
                                  variant="ghost"
                                  className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                               )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Room No.</Label>
                                <Input
                                  placeholder="101"
                                  className="h-12 rounded-xl"
                                  value={room.roomNumber}
                                  onChange={(e) => onRoomChange(index, 'roomNumber', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Monthly Price (LKR)</Label>
                                <Input
                                  type="number"
                                  placeholder="15000"
                                  className="h-12 rounded-xl"
                                  value={room.price}
                                  onChange={(e) => onRoomChange(index, 'price', e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Capacity</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  className="h-12 rounded-xl"
                                  value={room.capacity}
                                  onChange={(e) => onRoomChange(index, 'capacity', e.target.value)}
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400">Room Description</Label>
                              <Textarea
                                placeholder="E.g., Master bedroom with attached bathroom and private balcony..."
                                className="min-h-[100px] rounded-xl resize-none"
                                value={room.description}
                                onChange={(e) => onRoomChange(index, 'description', e.target.value)}
                              />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-50">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Individual Room Photos</Label>
                               <ImageUpload 
                                  maxImages={3} 
                                  initialImages={room.images || []}
                                  onUploadComplete={(urls) => onRoomChange(index, 'images', urls)} 
                               />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Room-Specific Facilities</Label>
                              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {ROOM_FACILITIES.map((facility) => {
                                  const Icon = facility.icon;
                                  const isSelected = (room.facilities || []).includes(facility.name);
                                  return (
                                    <div
                                      key={facility.name}
                                      onClick={() => toggleRoomFacility(index, facility.name)}
                                      className={`flex items-center gap-2 p-2.5 rounded-xl border border-dashed cursor-pointer transition-all active:scale-95 ${isSelected
                                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                                        : 'bg-slate-50/50 border-slate-200 text-slate-400 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                    >
                                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                      <span className="text-[11px] font-bold flex-1">{facility.name}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {form.type === 'full_property' ? 'Facilities & Amenities' : 'Property-Level Facilities & Shared Amenities'}
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {(form.type === 'full_property' ? AVAILABLE_FACILITIES : PROPERTY_FACILITIES).map((facility) => {
                      const Icon = facility.icon;
                      const isSelected = (form.facilities || []).includes(facility.name);
                      return (
                        <div
                          key={facility.name}
                          onClick={() => toggleFacility(facility.name)}
                          className={`flex items-center gap-2.5 p-3 rounded-[1rem] border-2 cursor-pointer transition-all active:scale-95 ${isSelected
                            ? 'bg-indigo-50/50 border-indigo-500 text-indigo-700 shadow-[0_4px_14px_rgba(99,102,241,0.15)]'
                            : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-100 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-bold flex-1">{facility.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={5} value={form.description} onChange={onChange} />
                </div>
                 <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={loading} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    {loading ? "Saving Changes..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/boardings")} className="rounded-xl">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="max-w-3xl rounded-2xl border border-rose-100 bg-rose-50/30 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-rose-600 font-bold uppercase tracking-wider text-xs">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </div>
              <CardTitle className="text-xl font-black tracking-tight text-slate-900">Delete Property Listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Unlist and archive this property from the platform. All associated rooms will be deactivated. This action cannot be performed if there are active tenant bookings.
              </p>
              <Button
                type="button"
                onClick={() => { setIsDeleteDialogOpen(true); setDeleteError(""); }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Property
              </Button>
            </CardContent>
          </Card>

          {/* Delete Confirmation Modal */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto sm:mx-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  Delete Property
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-900">"{form.boardingName || 'this property'}"</span>? This will unlist the property and archive all associated rooms from the marketplace.
                </DialogDescription>
              </DialogHeader>

              {deleteError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold space-y-1 animate-in fade-in">
                  <p className="font-black uppercase tracking-wider text-[10px] text-rose-500">Action Blocked</p>
                  <p>{deleteError}</p>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="rounded-xl h-12 font-bold flex-1"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteProperty}
                  className="rounded-xl h-12 font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 flex-1"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Unlisting..." : "Yes, Delete Property"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
