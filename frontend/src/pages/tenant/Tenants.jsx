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
        const bBookings = bookings.filter(book => book.boarding?._id === b._id);
        const pending = bBookings.filter(book => book.status === 'pending').length;
        return {
          _id: b._id,
          property: b.boardingName,
          location: b.address,
          occupied: `${b.occupiedRows || 0}/${b.totalRooms || 0}`,
          newRequests: pending,
          maintenance: 0, // Mock
          due: 0 // Mock
        };
      });

      setOpsData(data);
      setSummary({
        pending: bookings.filter(b => b.status === 'pending').length,
        maintenance: 0,
        issues: 0
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <AdminNavbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-12 space-y-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Users className="w-3 h-3" />
                Community Lifecycle
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mt-2">Resident <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Operations</span></h1>
              <p className="text-slate-500 font-medium max-w-lg">
                Orchestrate your tenant experience. Review move-ins, manage maintenance requests, and track settlement health.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/tenants/add" className="no-underline">
                <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:shadow-indigo-200 transition-all active:scale-95">
                  <Plus className="w-5 h-5 mr-3" /> Manual Onboard
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
            className="grid lg:grid-cols-3 gap-8"
          >
            {[
              { label: "Pending Requests", count: summary.pending, sub: "Entrance screening", icon: Mail, bg: "bg-indigo-50", text: "text-indigo-600" },
              { label: "Maintenance Tickets", count: summary.maintenance, sub: "Open work orders", icon: Wrench, bg: "bg-amber-50", text: "text-amber-600" },
              { label: "Payment Issues", count: summary.issues, sub: "Outstanding balances", icon: AlertTriangle, bg: "bg-rose-50", text: "text-rose-600" },
            ].map((action, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white p-6 group hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{action.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{action.count}</h3>
                        <p className="text-xs font-bold text-slate-500">{action.sub}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-300 group-hover:text-indigo-600 transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Property Control Boards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {loading && <p className="text-center p-12 text-slate-400 font-bold col-span-full">Sequencing community lifecycle data...</p>}
            {!loading && opsData.map((property, idx) => (
              <motion.div 
                key={property._id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="rounded-[3rem] border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:shadow-2xl transition-all duration-700">
                  <CardHeader className="p-10 pb-0">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{property.property}</h3>
                             <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px] uppercase tracking-widest px-3">
                                {property.location || 'Asset Location Restricted'}
                             </Badge>
                          </div>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Operations HUB</p>
                       </div>
                       <div className="text-right">
                          <p className="text-4xl font-black text-slate-900 leading-none">{property.occupied.split('/')[0]}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residents</p>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                       <div className="p-4 rounded-3xl bg-slate-50 space-y-1 group-hover:bg-indigo-50 transition-colors">
                          <Clock3 className="w-5 h-5 text-indigo-400 mb-2" />
                          <p className="text-xl font-black text-slate-900">{property.newRequests}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lease Apps</p>
                       </div>
                       <div className="p-4 rounded-3xl bg-slate-50 space-y-1 group-hover:bg-amber-50 transition-colors">
                          <Wrench className="w-5 h-5 text-amber-500 mb-2" />
                          <p className="text-xl font-black text-slate-900">{property.maintenance}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support</p>
                       </div>
                       <div className="p-4 rounded-3xl bg-slate-50 space-y-1 group-hover:bg-rose-50 transition-colors">
                          <AlertTriangle className="w-5 h-5 text-rose-500 mb-2" />
                          <p className="text-xl font-black text-slate-900">{property.due}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerts</p>
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Platform Banner */}
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
                        Detailed tenant identities and platform-wide screening records are managed in the Global Directory.
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
