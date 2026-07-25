import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  MapPin,
  BedDouble,
  Users,
  Pencil,
  Search,
  Grid2X2,
  List,
  Plus,
  Filter,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from "lucide-react";
import AdminNavbar from "@/components/common/AdminNavbar";
import Sidebar from "@/components/common/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getBoardings } from "@/api/boardings";
import { getValidImageUrl, onImageError } from "@/lib/images";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Boardings() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [boardingsList, setBoardingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchBoardings();
  }, []);

  const fetchBoardings = async () => {
    try {
      setLoading(true);
      const data = await getBoardings({ mine: "true" });
      setBoardingsList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = boardingsList.filter(p => {
    const matchesSearch = (p.boardingName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    if (filterType !== 'all') {
      return matchesSearch && p.type === filterType;
    }
    return matchesSearch;
  });

  const roomBasedCount = boardingsList.filter(p => p.type === 'room_based').length;
  const fullPropertyCount = boardingsList.filter(p => p.type === 'full_property').length;
  const totalRooms = boardingsList.reduce((acc, p) => acc + (p.totalRooms || 0), 0);
  const totalOccupied = boardingsList.reduce((acc, p) => acc + ((p.totalRooms || 0) - (p.availableRooms || 0)), 0);
  const occupancyRate = totalRooms > 0 ? ((totalOccupied / totalRooms) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-12 space-y-8 sm:space-y-10 min-w-0">
          {/* Header & Search */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Building2 className="w-3.5 h-3.5" />
                Asset Management
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mt-2">Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Portfolio</span></h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base">Manage and monitor your properties across all locations.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full xl:w-auto">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  placeholder="Search properties..."
                  className="h-12 sm:h-14 pl-12 pr-4 rounded-[1.25rem] border-none bg-white shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-indigo-600/20 font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between sm:justify-start bg-white p-1 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50">
                <div className="flex items-center">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={`rounded-xl h-10 w-10 sm:h-12 sm:w-12 transition-all ${viewMode === 'grid' ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
                  >
                    <Grid2X2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={`rounded-xl h-10 w-10 sm:h-12 sm:w-12 transition-all ${viewMode === 'list' ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'text-slate-400'}`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
              <Link to="/boardings/add" className="no-underline w-full sm:w-auto">
                <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-[1.25rem] bg-indigo-600 text-white font-black shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 w-full">
                  <Plus className="w-5 h-5 mr-2 sm:mr-3" /> Add Asset
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${boardingsList.length})` },
                { id: 'room_based', label: `Room-Based (${roomBasedCount})` },
                { id: 'full_property', label: `Full Property (${fullPropertyCount})` }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-extrabold uppercase tracking-wider transition-all ${
                    filterType === pill.id 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-400">
              Occupancy: <span className="text-indigo-600 font-black">{occupancyRate}%</span> ({totalOccupied}/{totalRooms} Units)
            </div>
          </div>

          {/* Properties Display */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key={loading ? "grid-loading" : "grid"}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {loading && [1, 2, 3].map(n => (
                  <div key={n} className="h-96 rounded-[2.5rem] bg-slate-200/60 animate-pulse" />
                ))}
                {!loading && filteredProperties.map((p) => (
                  <motion.div key={p._id} variants={cardVariants} className="group">
                    <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 flex flex-col h-full border-b-8 border-transparent hover:border-indigo-600/30">
                      <div className="relative h-64 overflow-hidden">
                        <img src={getValidImageUrl(p.images)} alt={p.boardingName} onError={onImageError} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                          <Badge className={`w-fit font-black rounded-lg px-3 py-1 text-[10px] uppercase tracking-widest ${p.availableRooms === 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {p.availableRooms === 0 ? 'Full' : 'Active'}
                          </Badge>
                          <h3 className="text-2xl font-black text-white mt-2 leading-none">{p.boardingName}</h3>
                          <p className="text-slate-300 text-xs font-bold mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {p.address}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-8 space-y-8 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Inventory</p>
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-4 h-4 text-indigo-600" />
                              <span className="text-lg font-black text-slate-900">{p.totalRooms || 0} Units</span>
                            </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-50 space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-emerald-600" />
                              <span className="text-lg font-black text-slate-900">{p.type === 'room_based' ? 'Room-Based' : 'Full Prop'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white ring-2 ring-slate-50"></div>
                              ))}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">+{p.totalRooms - (p.availableRooms || 0)} Tenants</span>
                          </div>
                          <Link to={`/boardings/edit/${p._id}`} className="no-underline">
                            <Button size="icon" className="h-12 w-12 rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 shadow-xl transition-all">
                              <Pencil className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {!loading && filteredProperties.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <Building2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No properties found</h3>
                    <p className="text-slate-500 font-medium">Try adjusting your search or add a new asset to your portfolio.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 10 }}
                className="space-y-6"
              >
                {filteredProperties.map((p) => (
                  <motion.div key={p._id} variants={cardVariants}>
                    <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/40 bg-white group hover:shadow-xl transition-all duration-500 overflow-hidden border-l-8 border-transparent hover:border-indigo-600">
                      <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8 w-full lg:w-auto">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 hidden sm:block">
                            <img src={getValidImageUrl(p.images)} alt={p.boardingName} onError={onImageError} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-black text-slate-900">{p.boardingName}</h3>
                              <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-2 py-0 border-none uppercase ${p.availableRooms === 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {p.availableRooms === 0 ? 'Full' : 'Active'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {p.address}</span>
                              <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-blue-500" /> {p.totalRooms} units</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-10 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-10">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Tenants</p>
                            <p className="text-xl font-black text-slate-800">{p.totalRooms - (p.availableRooms || 0)} Residents</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black text-indigo-600">{p.totalRooms ? Math.round(((p.totalRooms - p.availableRooms) / p.totalRooms) * 100) : 0}%</span>
                              <Progress value={p.totalRooms ? ((p.totalRooms - p.availableRooms) / p.totalRooms) * 100 : 0} className="w-24 h-2 bg-slate-50" indicatorClassName="bg-indigo-600" />
                            </div>
                          </div>
                          <Link to={`/boardings/edit/${p._id}`} className="no-underline shrink-0 ml-auto lg:ml-0">
                            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 font-black text-slate-800 hover:bg-slate-50 hover:border-indigo-600/30 transition-all flex items-center gap-3 active:scale-95">
                              <Pencil className="w-4 h-4" /> Manage
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-slate-900 p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="space-y-4 relative z-10 text-center lg:text-left">
              <h4 className="text-3xl font-black tracking-tight leading-none">Portfolio Summary</h4>
              <p className="text-slate-400 font-medium whitespace-nowrap">You are managing <span className="text-white font-bold">{roomBasedCount} room-based</span> and <span className="text-white font-bold">{fullPropertyCount} full property</span> boardings.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10 relative z-10 w-full lg:w-auto">
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Room-Based</p>
                <p className="text-4xl font-black">{roomBasedCount}</p>
              </div>
              <div className="w-px h-12 bg-slate-800 hidden lg:block"></div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Full Property</p>
                <p className="text-4xl font-black">{fullPropertyCount}</p>
              </div>
              <div className="w-px h-12 bg-slate-800 hidden lg:block"></div>
              <div className="space-y-1 text-center">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">Efficiency</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                  <p className="text-4xl font-black">{occupancyRate}%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
