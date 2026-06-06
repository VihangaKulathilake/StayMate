import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  CheckCircle2
} from "lucide-react";
import PlatformAdminNavbar from "@/components/common/PlatformAdminNavbar";
import PlatformAdminSidebar from "@/components/common/PlatformAdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getBoardings } from "@/api/boardings";
import { getBookings } from "@/api/bookings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

  useEffect(() => {
    fetchBoardings();
  }, [ownerId, tenantId]);

  const fetchBoardings = async () => {
    try {
      setLoading(true);
      let data = [];
      
      if (ownerId) {
        data = await getBoardings({ owner: ownerId });
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
        data = await getBoardings();
      }
      
      setBoardingsList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

                        <div className="flex flex-wrap items-center gap-10 border-t xl:border-t-0 xl:border-l border-slate-50 pt-8 xl:pt-0 xl:pl-10 w-full xl:w-auto">
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
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

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
