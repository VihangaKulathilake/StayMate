import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  Plus,
  ArrowUpRight,
  ChevronDown,
  BedDouble,
  CreditCard,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Archive,
  XCircle,
  Pencil
} from "lucide-react";
import PlatformAdminNavbar from "@/components/common/PlatformAdminNavbar";
import PlatformAdminSidebar from "@/components/common/PlatformAdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBoardings, updateBoarding, deleteBoarding } from "@/api/boardings";
import { getBookings } from "@/api/bookings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function AdminBoardings() {
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get("owner");
  const tenantId = searchParams.get("tenant");
  
  const [boardingsList, setBoardingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [boardingToDelete, setBoardingToDelete] = useState(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchBoardings();
  }, [ownerId, tenantId]);

  const fetchBoardings = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (ownerId) {
        data = await getBoardings({ owner: ownerId, includeArchived: "true" });
      } else if (tenantId) {
        const bookings = await getBookings({ tenantId });
        // Map bookings to unique boardings
        const boardingsMap = new Map();
        bookings.forEach(b => {
          if (b.boarding && !boardingsMap.has(b.boarding._id)) {
            boardingsMap.set(b.boarding._id, b.boarding);
          }
        });
        data = Array.from(boardingsMap.values());
      } else {
        data = await getBoardings({ includeArchived: "true" });
      }
      
      setBoardingsList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await updateBoarding(id, { status });
      setBoardingsList(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBoarding = async () => {
    if (!boardingToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteError("");
      await deleteBoarding(boardingToDelete._id, { permanent: isPermanentDelete });
      setBoardingsList(prev => prev.filter(b => b._id !== boardingToDelete._id));
      setBoardingToDelete(null);
      setIsPermanentDelete(false);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err.message || "Failed to delete boarding.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBoardings = boardingsList.filter(b =>
    b.boardingName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-violet-100 selection:text-violet-900">
      <PlatformAdminNavbar />
      <div className="flex">
        <PlatformAdminSidebar />
        <main className="flex-1 p-6 lg:p-12 space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row xl:items-end justify-between gap-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-violet-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Building2 className="w-3 h-3" />
                {ownerId || tenantId ? 'Filtered Search Matrix' : 'Platform Asset Directory'}
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mt-2">
                Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Boardings</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg">
                {ownerId ? 'Viewing properties owned by the selected landlord identity.' : 
                 tenantId ? 'Viewing properties currently or previously registered to this tenant.' :
                 'Audit registered properties, ensure compliance with platform standards, and monitor capacity.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <Input
                  placeholder="Search properties..."
                  className="h-14 pl-12 pr-4 rounded-[1.25rem] border-none bg-white shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-violet-600/20 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50">
            <div className="flex items-center gap-4">
              <span className="px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-violet-600 bg-violet-50 py-2">
                All Assets ({boardingsList.length})
              </span>
            </div>
            {(ownerId || tenantId) && (
               <Link to="/admin/boardings">
                 <Button 
                  variant="outline" 
                  className="rounded-xl border-slate-100 font-bold text-xs"
                 >
                   Clear Filters
                 </Button>
               </Link>
            )}
          </div>

          {/* Directory List */}
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="w-10 h-10 border-4 border-t-violet-600 border-slate-200 rounded-full"
                />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scanning property registry...</p>
             </div>
          ) : filteredBoardings.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
               <h3 className="text-xl font-black text-slate-900">No matches found</h3>
               <p className="text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-6">
                {filteredBoardings.map((boarding) => (
                  <motion.div key={boarding._id} variants={itemVariants} initial="hidden" animate="visible" exit="hidden" layout>
                    <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden border-l-8 border-transparent hover:border-violet-600">
                      <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="flex items-center gap-8 flex-1">
                          <div className="w-20 h-20 rounded-[1.75rem] overflow-hidden bg-violet-50 flex-shrink-0 relative shadow-sm">
                            {boarding.images?.[0] ? (
                              <img src={boarding.images[0]} alt={boarding.boardingName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-violet-300">
                                <Home className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-violet-600 transition-colors">{boarding.boardingName}</h3>
                              {boarding.status === 'approved' ? (
                                <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-2 py-0 border-none uppercase bg-emerald-50 text-emerald-600`}>
                                  Approved
                                </Badge>
                              ) : (
                                <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-2 py-0 border-none uppercase bg-amber-50 text-amber-600`}>
                                  {boarding.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-400" /> {boarding.city} - {boarding.address}</span>
                              <span className="flex items-center gap-1.5"><Home className="w-4 h-4 text-indigo-400" /> {boarding.type === 'full_property' ? 'Full Property' : 'Room Based'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 sm:gap-10 border-t xl:border-t-0 xl:border-l border-slate-50 pt-8 xl:pt-0 xl:pl-10 w-full xl:w-auto justify-between xl:justify-start">
                          <div className="space-y-1 min-w-[120px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate / Month</p>
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-5 h-5 text-emerald-600" />
                              <span className="text-2xl font-black text-slate-900">
                                Rs. {boarding.price ? (boarding.price / 1000).toFixed(1) : '??'}
                                <span className="text-sm font-bold text-slate-400">k</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={actionLoading === boarding._id}
                                  className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all shadow-sm"
                                >
                                  <MoreHorizontal className="w-5 h-5 text-slate-700" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 bg-white">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                                  Moderation Controls
                                </DropdownMenuLabel>
                                {boarding.status !== 'approved' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(boarding._id, 'approved')}
                                    className="rounded-xl font-bold text-xs text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer p-2.5"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Approve Listing
                                  </DropdownMenuItem>
                                )}
                                {boarding.status !== 'rejected' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(boarding._id, 'rejected')}
                                    className="rounded-xl font-bold text-xs text-amber-600 focus:bg-amber-50 focus:text-amber-700 cursor-pointer p-2.5"
                                  >
                                    <XCircle className="w-4 h-4 mr-2 text-amber-500" /> Reject Listing
                                  </DropdownMenuItem>
                                )}
                                {boarding.status !== 'archived' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateStatus(boarding._id, 'archived')}
                                    className="rounded-xl font-bold text-xs text-slate-600 focus:bg-slate-50 focus:text-slate-700 cursor-pointer p-2.5"
                                  >
                                    <Archive className="w-4 h-4 mr-2 text-slate-400" /> Archive / Unlist
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to={`/boardings/edit/${boarding._id}`} className="rounded-xl font-bold text-xs text-slate-700 focus:bg-slate-50 flex items-center cursor-pointer p-2.5">
                                    <Pencil className="w-4 h-4 mr-2 text-slate-400" /> Edit Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => { setBoardingToDelete(boarding); setDeleteError(""); setIsPermanentDelete(false); }}
                                  className="rounded-xl font-bold text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer p-2.5"
                                >
                                  <Trash2 className="w-4 h-4 mr-2 text-rose-500" /> Delete Property
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Admin Delete Confirmation Modal */}
          <Dialog open={Boolean(boardingToDelete)} onOpenChange={(open) => { if (!open) setBoardingToDelete(null); }}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
              <DialogHeader className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto sm:mx-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <DialogTitle className="text-2xl font-black text-slate-900">
                  Delete Property
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium text-sm leading-relaxed">
                  Choose how to handle the deletion of <span className="font-bold text-slate-900">"{boardingToDelete?.boardingName}"</span>.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPermanentDelete}
                    onChange={(e) => setIsPermanentDelete(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Permanent Database Purge (Hard Delete)
                    </span>
                    <p className="text-[11px] font-medium text-slate-500 leading-snug">
                      Check this box ONLY for spam/fraud. Completely removes the boarding, rooms, and reviews from the database.
                    </p>
                  </div>
                </label>
              </div>

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
                  onClick={() => setBoardingToDelete(null)}
                  className="rounded-xl h-12 font-bold flex-1"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteBoarding}
                  className="rounded-xl h-12 font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 flex-1"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Processing..." : isPermanentDelete ? "Hard Purge Property" : "Archive & Unlist"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Quality Audit Banner */}
          {!ownerId && !tenantId && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-[3rem] bg-indigo-600 p-12 text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-slate-900/5"></div>
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000"></div>

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="space-y-4 text-center lg:text-left">
                  <h4 className="text-4xl font-black tracking-tight leading-none">Property Quality Index</h4>
                  <p className="text-indigo-100 font-medium text-lg leading-relaxed max-w-sm">
                    Run automated quality audits on existing properties to ensure they meet the minimum platform standard.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 bg-black/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Total Assets</p>
                    <p className="text-4xl font-black">{boardingsList.length}</p>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest">Needs Review</p>
                    <p className="text-4xl font-black">{boardingsList.filter(b => b.status === 'pending').length}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
