import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  Wrench, 
  AlertTriangle, 
  Clock3, 
  Users, 
  ChevronRight, 
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Mail,
  MoreHorizontal
} from "lucide-react";
import AdminNavbar from "@/components/common/AdminNavbar";
import Sidebar from "@/components/common/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getBoardings } from "@/api/boardings";
import { getBookings } from "@/api/bookings";



const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

export default function Tenants() {
  const [opsData, setOpsData] = React.useState([]);
  const [summary, setSummary] = React.useState({ pending: 0, maintenance: 0, issues: 0 });
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterTab, setFilterTab] = React.useState("all");

  React.useEffect(() => {
    fetchOpsData();
  }, []);

  const fetchOpsData = async () => {
    try {
      setLoading(true);
      const [boardings, bookings] = await Promise.all([
        getBoardings(),
        getBookings()
      ]);

      const data = boardings.map(b => {
        const bBookings = bookings.filter(book => book.boarding?._id === b._id || book.boarding === b._id);
        const pending = bBookings.filter(book => book.status === 'pending').length;
        const approved = bBookings.filter(book => book.status === 'approved').length;
        const totalRooms = b.totalRooms || 1;
        const occupiedCount = Math.min(approved, totalRooms);
        
        return {
          _id: b._id,
          property: b.boardingName,
          location: b.address || b.city || "Property Location",
          occupied: `${occupiedCount}/${totalRooms}`,
          newRequests: pending,
          activeTenants: approved,
          maintenance: 0,
          due: bBookings.filter(book => book.status === 'cancelled' || book.status === 'rejected').length
        };
      });

      setOpsData(data);
      const totalPending = bookings.filter(b => b.status === 'pending').length;
      const totalActive = bookings.filter(b => b.status === 'approved').length;
      const totalIssues = bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length;

      setSummary({
        pending: totalPending,
        maintenance: totalActive,
        issues: totalIssues
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpsData = opsData.filter(property => {
    const matchesSearch = property.property?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTab === "pending") return matchesSearch && property.newRequests > 0;
    if (filterTab === "active") return matchesSearch && property.activeTenants > 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 min-w-0">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Users className="w-3.5 h-3.5" />
                Community Lifecycle
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mt-2">Resident <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Operations</span></h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-lg">
                Orchestrate your tenant experience. Review move-ins, manage resident applications, and track property capacity.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search properties..." 
                  className="pl-9 h-12 rounded-xl bg-white border-slate-200 shadow-sm font-semibold text-sm w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Link to="/tenants/add" className="no-underline w-full sm:w-auto">
                <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 w-full">
                  <Plus className="w-5 h-5 mr-2" /> Onboard Resident
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions / Triage */}
          <motion.section 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {[
              { label: "Pending Requests", count: summary.pending, sub: "Entrance screening", icon: Mail, bg: "bg-indigo-50", text: "text-indigo-600", key: "pending" },
              { label: "Active Residents", count: summary.maintenance, sub: "Verified occupancy", icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-600", key: "active" },
              { label: "Rejected / Cancelled", count: summary.issues, sub: "Closed applications", icon: AlertTriangle, bg: "bg-rose-50", text: "text-rose-600", key: "all" },
            ].map((action, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card 
                  onClick={() => setFilterTab(action.key)}
                  className={`rounded-2xl sm:rounded-[2.5rem] border-2 ${filterTab === action.key ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-transparent'} shadow-lg shadow-slate-200/40 bg-white p-5 sm:p-6 group hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${action.bg} ${action.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{action.label}</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{action.count}</h3>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-500">{action.sub}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0">
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Interactive Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 sm:p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { id: 'all', label: 'All Properties' },
                { id: 'pending', label: 'Needs Action' },
                { id: 'active', label: 'Active Occupancy' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all ${filterTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 px-2">
              Showing {filteredOpsData.length} property Hubs
            </span>
          </div>

          {/* Property Control Boards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
            {loading && (
              <div className="col-span-full py-16 text-center">
                <p className="text-slate-400 font-bold tracking-wider animate-pulse">Sequencing community lifecycle data...</p>
              </div>
            )}
            {!loading && filteredOpsData.length === 0 && (
              <div className="col-span-full p-8 sm:p-12 text-center bg-white rounded-3xl sm:rounded-[2.5rem] border border-dashed border-slate-200">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base sm:text-lg font-bold text-slate-700">No operations match your current filter</h4>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Try searching another term or resetting your filter tabs.</p>
                <Button onClick={() => { setSearchTerm(''); setFilterTab('all'); }} variant="outline" className="mt-4 rounded-xl font-bold">
                  Reset Filter
                </Button>
              </div>
            )}
            {!loading && filteredOpsData.map((property, idx) => (
              <motion.div 
                key={property._id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <Card className="rounded-3xl sm:rounded-[3rem] border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="p-6 sm:p-8 md:p-10 pb-0">
                    <div className="flex items-start sm:items-center justify-between gap-4">
                       <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                             <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{property.property}</h3>
                             <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-0.5">
                                {property.location || 'Asset Location'}
                             </Badge>
                          </div>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Operations HUB</p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">{property.occupied.split('/')[0]}</p>
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Residents</p>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                       <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 space-y-1 group-hover:bg-indigo-50 transition-colors">
                          <Clock3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 mb-1.5 sm:mb-2" />
                          <p className="text-lg sm:text-xl font-black text-slate-900">{property.newRequests}</p>
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Lease Apps</p>
                       </div>
                       <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 space-y-1 group-hover:bg-emerald-50 transition-colors">
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mb-1.5 sm:mb-2" />
                          <p className="text-lg sm:text-xl font-black text-slate-900">{property.activeTenants}</p>
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Active</p>
                       </div>
                       <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 space-y-1 group-hover:bg-slate-100 transition-colors">
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mb-1.5 sm:mb-2" />
                          <p className="text-lg sm:text-xl font-black text-slate-900">{property.due}</p>
                          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Closed</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Security Banner */}
            <motion.div 
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="flex flex-col h-full"
            >
               <Card className="rounded-[3rem] border-0 shadow-2xl bg-slate-900 text-white p-12 flex flex-col justify-between flex-grow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
                  <div className="space-y-6 relative z-10">
                     <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mb-10">
                        <ShieldCheck className="w-8 h-8 text-indigo-400" />
                     </div>
                     <h3 className="text-4xl font-black tracking-tight leading-none">Security &<br/>Compliance</h3>
                     <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                        Detailed tenant identities and platform-wide screening records are managed securely in real time.
                     </p>
                  </div>
               </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
