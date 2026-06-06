import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BadgeCheck, 
  UserRound, 
  Mail, 
  Phone, 
  Ban, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  CheckCircle2,
  ChevronDown,
  ArrowUpRight,
  Fingerprint,
  Clock3
} from "lucide-react";
import PlatformAdminNavbar from "@/components/common/PlatformAdminNavbar";
import PlatformAdminSidebar from "@/components/common/PlatformAdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers } from "@/api/users";
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AdminTenants() {
  const [tenantsList, setTenantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setTenantsList(data.filter(u => u.role === 'tenant'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenantsList.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100 selection:text-indigo-900">
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
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Fingerprint className="w-3 h-3" />
                Global Resident Directory
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mt-2">Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Tenants</span></h1>
              <p className="text-slate-500 font-medium max-w-lg">
                Verified identity matching, trust score monitoring, and global residence policy enforcement across the network nodes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input 
                  placeholder="Search tenants..." 
                  className="h-14 pl-12 pr-4 rounded-[1.25rem] border-none bg-white shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-indigo-600/20 font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-50">
            <div className="flex items-center gap-4">
              <span className="px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 bg-indigo-50 py-2">
                All Residents ({tenantsList.length})
              </span>
            </div>
          </div>

          {/* Directory List Container */}
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                   className="w-10 h-10 border-4 border-t-indigo-600 border-slate-200 rounded-full"
                />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Scanning tenant signatures...</p>
             </div>
          ) : (
            <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="space-y-6"
            >
              {filteredTenants.map((tenant) => (
                <motion.div key={tenant._id} variants={itemVariants}>
                  <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden border-l-8 border-transparent hover:border-indigo-600">
                    <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                       <div className="flex items-center gap-8 flex-1">
                          <div className="relative group/avatar">
                             <div className="w-20 h-20 rounded-[1.75rem] border-4 border-slate-100 bg-slate-50 flex items-center justify-center text-3xl font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                {tenant.name?.[0] || "?"}
                             </div>
                             {tenant.isVerified && (
                               <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                                  <CheckCircle2 className="w-4 h-4" />
                               </div>
                             )}
                          </div>
                          <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{tenant.name}</h3>
                                <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-2 py-0 border-none uppercase ${tenant.isVerified ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                   {tenant.isVerified ? 'ID MATCHED' : 'UNVERIFIED'}
                                </Badge>
                             </div>
                             <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-400" /> {tenant.email}</span>
                                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-violet-400" /> {tenant.phone || 'Not provided'}</span>
                                <span className="flex items-center gap-1.5"><Clock3 className="w-4 h-4 text-slate-300" /> Member since {new Date(tenant.createdAt).getFullYear()}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap items-center gap-12 border-t xl:border-t-0 xl:border-l border-slate-50 pt-8 xl:pt-0 xl:pl-12 w-full xl:w-auto">
                          <div className="space-y-2 text-center min-w-[100px]">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Trust Score</p>
                             <p className={`text-4xl font-black ${(tenant.score || 100) > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{tenant.score || 100}</p>
                             <div className="h-1.5 w-24 bg-slate-50 rounded-full overflow-hidden mx-auto">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${tenant.score || 100}%` }}
                                  className={`h-full ${(tenant.score || 100) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                />
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-auto xl:ml-0">
                             <Link to={`/admin/users/${tenant._id}`}>
                                <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:shadow-indigo-200 transition-all flex items-center gap-3 active:scale-95 group/btn">
                                   Audit Profile <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </Button>
                             </Link>
                          </div>
                       </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Compliance & Policy Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-[3rem] bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-200/50 relative overflow-hidden group"
          >
             <div className="absolute top-0 left-0 w-full h-full bg-black/5" />
             <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
             
             <div className="relative z-10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                   <ShieldAlert className="w-8 h-8 text-indigo-200" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-xl font-black tracking-tight">System Policy Compliance</h4>
                   <p className="text-indigo-100 font-medium max-w-sm">Resident data is encrypted and managed according to global privacy standards.</p>
                </div>
             </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
