import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Building2,
  Mail,
  Phone,
  Search,
  Filter,
  MoreHorizontal,
  ShieldCheck,
  UserPlus,
  ArrowUpRight,
  ChevronDown
} from "lucide-react";
import PlatformAdminNavbar from "@/components/common/PlatformAdminNavbar";
import PlatformAdminSidebar from "@/components/common/PlatformAdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/api/users";
import { getBoardings } from "@/api/boardings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function AdminLandlords() {
  const [landlordsList, setLandlordsList] = useState([]);
  const [boardingsList, setBoardingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLandlords();
  }, []);

  const fetchLandlords = async () => {
    try {
      setLoading(true);
      const [userData, boardingsData] = await Promise.all([
        getUsers(),
        getBoardings()
      ]);
      setLandlordsList(userData.filter(u => u.role === 'landlord'));
      setBoardingsList(boardingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLandlords = landlordsList.filter(l =>
    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
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
                <ShieldCheck className="w-3 h-3" />
                Asset Custodian Registry
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mt-2">Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Landlords</span></h1>
              <p className="text-slate-500 font-medium max-w-lg">
                Audit registered hosts, perform identity verification, and monitor ecosystem property saturation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                <Input
                  placeholder="Search providers..."
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
                All Providers ({landlordsList.length})
              </span>
            </div>
          </div>

          {/* Directory List */}
          {loading ? (
            <p className="text-center p-12 text-slate-400 font-bold">Scanning landlord directory...</p>
          ) : (
            filteredLandlords.map((landlord) => (
              <motion.div key={landlord._id} variants={itemVariants}>
                <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden border-l-8 border-transparent hover:border-violet-600">
                  <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="w-20 h-20 rounded-[1.75rem] bg-violet-50 text-violet-600 flex items-center justify-center text-3xl font-black group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                        {landlord.name?.[0] || 'L'}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-violet-600 transition-colors">{landlord.name || 'Anonymous Provider'}</h3>
                          <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-2 py-0 border-none uppercase bg-emerald-50 text-emerald-600`}>
                            Verified
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-violet-400" /> {landlord.email}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-indigo-400" /> {landlord.phone || 'Not provided'}</span>
                          <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-slate-300" /> Joined Platform</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-10 border-t xl:border-t-0 xl:border-l border-slate-50 pt-8 xl:pt-0 xl:pl-10 w-full xl:w-auto">
                      <div className="space-y-1 min-w-[120px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scale</p>
                        <div className="flex flex-col items-center gap-1">
                          <Building2 className="w-6 h-6 text-indigo-600" />
                          <span className="text-xl font-black text-slate-900 leading-none">{boardingsList.filter(b => b.owner?._id === landlord._id).length || 0}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assets</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto xl:ml-0">
                        <Link to={`/admin/users/${landlord._id}`}>
                          <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:shadow-violet-200 transition-all flex items-center gap-3 active:scale-95 group/btn">
                            Audit Profile <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-100 hover:bg-slate-50">
                              <MoreHorizontal className="w-5 h-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 border-slate-100 shadow-2xl">
                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer">Suspend Account</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer">Modify Limits</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold cursor-pointer text-rose-600">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}

          {/* Audit Trail Banner */}
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
                <h4 className="text-4xl font-black tracking-tight leading-none">Security Monitoring</h4>
                <p className="text-indigo-100 font-medium text-lg leading-relaxed max-w-sm">
                  All provider changes are logged in the platform immutable audit trail for compliance.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 bg-black/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/5">
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Active Hosts</p>
                  <p className="text-4xl font-black">{landlordsList.length}</p>
                </div>
                <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Growth</p>
                  <p className="text-4xl font-black">+{landlordsList.filter(l => new Date(l.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
