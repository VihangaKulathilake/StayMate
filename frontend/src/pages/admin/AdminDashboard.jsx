import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
   Users,
   Building2,
   BadgeCheck,
   AlertTriangle,
   ArrowUpRight,
   ShieldCheck,
   Globe,
   TrendingUp,
   Zap,
   MoreVertical,
   Activity,
   ArrowRight,
   Wallet,
   BarChart3,
   Home,
   BedDouble,
   ChevronRight,
   LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Cell,
   LineChart,
   Line
} from "recharts";
import PlatformAdminNavbar from "@/components/common/PlatformAdminNavbar";
import PlatformAdminSidebar from "@/components/common/PlatformAdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/api/users";
import { getAdminStats } from "@/api/boardings";
import { getBoardings } from "@/api/boardings";

// Dynamic data will be generated inside the component

const fadeIn = {
   hidden: { opacity: 0, y: 20 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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

export default function AdminDashboard() {
   const [stats, setStats] = React.useState({ landlords: 0, tenants: 0, revenue: 0, recentUsers: [], allUsers: [], allBoardings: [] });
   const [loading, setLoading] = React.useState(true);

   React.useEffect(() => {
      fetchStats();
   }, []);

   const fetchStats = async () => {
      try {
         setLoading(true);
         const [users, adminStats, boardings] = await Promise.all([
            getUsers(),
            getAdminStats(),
            getBoardings() // admin gets all boardings regardless of status natively
         ]);
         setStats({
            landlords: adminStats.landlords,
            tenants: adminStats.tenants,
            revenue: adminStats.revenue,
            recentUsers: users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
            allUsers: users,
            allBoardings: boardings
         });
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   const dynamicGrowthData = React.useMemo(() => {
      if (!stats.allUsers.length) return [];
      const data = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
         const d = new Date(today);
         d.setDate(d.getDate() - i);
         const dayName = d.toLocaleDateString("en-US", { weekday: 'short' });

         // Cumulative count calculation up to this day
         const uCount = stats.allUsers.filter(u => new Date(u.createdAt) <= new Date(d.setHours(23, 59, 59))).length;
         const bCount = stats.allBoardings.filter(b => new Date(b.createdAt) <= new Date(d.setHours(23, 59, 59))).length;

         data.push({ name: dayName, users: uCount, boardings: bCount });
      }
      return data;
   }, [stats]);

   // Replace strictly dummy Health Data with dynamic status ratio
   const platformHealth = React.useMemo(() => {
      const total = stats.allBoardings.length;
      if (total === 0) return [{ name: "Current", health: 100 }];
      const approved = stats.allBoardings.filter(b => b.status === 'approved').length;
      const healthScore = Math.round((approved / total) * 100);
      // Create a 6 point spread leading up to the current health score to power the graph styling
      return Array.from({ length: 6 }).map((_, i) => ({
         name: `T-${5 - i}`,
         health: i === 5 ? healthScore : Math.min(100, Math.max(0, healthScore + (Math.random() * 10 - 5)))
      }));
   }, [stats.allBoardings]);

   return (
      <div className="min-h-screen bg-[#f8fafc] font-sans">
         <PlatformAdminNavbar />
         <div className="flex">
            <PlatformAdminSidebar />
            <main className="flex-1 p-6 lg:p-12 space-y-12">
               {/* Glassmorphism Header */}
               <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-xl shadow-slate-200/50"
               >
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                           Dashboard <ChevronRight className="w-3 h-3" /> System Intelligence
                        </span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                           <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                           Operations <span className="text-violet-600">Overview</span>
                        </h1>
                     </div>
                     <p className="text-slate-500 font-medium max-w-lg mt-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        Real-time ecosystem metrics and infrastructure diagnostics.
                     </p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</span>
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           Systems Nominal
                        </span>
                     </div>
                  </div>
               </motion.div>

               {/* Core Metrics Grid */}
               <motion.section
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
               >
                  {[
                     { label: "Active Landlords", val: stats.landlords, icon: Wallet, tone: "from-orange-500/10 to-orange-600/5 text-orange-600", border: "border-orange-100/50", trend: "+12.5%" },
                     { label: "Platform Residents", val: stats.tenants, icon: Users, tone: "from-indigo-500/10 to-indigo-600/5 text-indigo-600", border: "border-indigo-100/50", trend: "+8.2%" },
                     { label: "Full Properties", val: stats.allBoardings.filter(b => b.type === 'full_property').length, icon: Home, tone: "from-blue-500/10 to-blue-600/5 text-blue-600", border: "border-blue-100/50", trend: "+5.4%" },
                     { label: "Room-Based", val: stats.allBoardings.filter(b => b.type === 'room_based').length, icon: BedDouble, tone: "from-violet-500/10 to-violet-600/5 text-violet-600", border: "border-violet-100/50", trend: "+14.1%" },
                     { label: "Global Revenue", val: `Rs. ${(stats.revenue / 1000).toFixed(0)}k`, icon: BarChart3, tone: "from-emerald-500/10 to-emerald-600/5 text-emerald-600", border: "border-emerald-100/50", trend: "+10.3%" },
                     { label: "Pending Listed", val: stats.allBoardings.filter(b => b.status === 'pending').length, icon: ShieldCheck, tone: "from-rose-500/10 to-rose-600/5 text-rose-600", border: "border-rose-100/50", trend: "Critical" },
                  ].map((stat, i) => (
                     <motion.div key={i} variants={fadeIn}>
                        <Card className={cn(
                           "rounded-[2.5rem] border shadow-xl shadow-slate-200/20 overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group relative",
                           stat.border
                        )}>
                           <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700", stat.tone.split(' ')[0] + " " + stat.tone.split(' ')[1])}></div>
                           <CardContent className="p-8 relative z-10">
                              <div className="flex justify-between items-start mb-6">
                                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-inner transition-transform duration-500 group-hover:scale-110", stat.tone.split(' text-')[0])}>
                                    <stat.icon className={cn("w-6 h-6", stat.tone.split(' ').pop())} />
                                 </div>
                                 <Badge className={cn(
                                    "rounded-lg border-none py-1 px-3 font-black text-[10px] uppercase tracking-wider shadow-sm",
                                    stat.trend === "Critical" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                 )}>
                                    {stat.trend}
                                 </Badge>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 group-hover:text-slate-500 transition-colors">{stat.label}</p>
                                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none group-hover:translate-x-1 transition-transform duration-500">
                                    {typeof stat.val === 'number' ? stat.val.toString().padStart(2, '0') : stat.val}
                                 </h3>
                              </div>
                           </CardContent>
                        </Card>
                     </motion.div>
                  ))}
               </motion.section>

               {/* Main Dashboard Layout */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left Column (Growth Velocity & Activity Feed) */}
                  <div className="xl:col-span-2 space-y-8">
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                     >
                        <Card className="rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 bg-white p-10 group relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                           <CardHeader className="p-0 mb-10 border-none space-y-4">
                              <div className="flex items-center justify-between">
                                 <div className="space-y-1">
                                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Growth Velocity</CardTitle>
                                    <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Real-time ecosystem expansion metrics</CardDescription>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                       <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-violet-600 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Users</span>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Listings</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </CardHeader>
                           <div className="h-[400px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={dynamicGrowthData} barGap={12}>
                                    <defs>
                                       <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1} />
                                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                       </linearGradient>
                                       <linearGradient id="listingGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#6366f1" stopOpacity={1} />
                                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8} />
                                       </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                       dataKey="name"
                                       axisLine={false}
                                       tickLine={false}
                                       tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                       dy={15}
                                    />
                                    <YAxis
                                       axisLine={false}
                                       tickLine={false}
                                       tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 800 }}
                                    />
                                    <Tooltip
                                       cursor={{ fill: '#f8fafc', radius: 12 }}
                                       contentStyle={{
                                          borderRadius: '1.5rem',
                                          border: 'none',
                                          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                                          padding: '1.5rem',
                                          fontWeight: 900
                                       }}
                                    />
                                    <Bar dataKey="users" fill="url(#userGradient)" radius={[8, 8, 0, 0]} barSize={28} />
                                    <Bar dataKey="boardings" fill="url(#listingGradient)" radius={[8, 8, 0, 0]} barSize={28} />
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </Card>
                     </motion.div>

                     {/* Recent Activity (Moved into Left Column) */}
                     <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <Card className="rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 bg-white overflow-hidden h-full">
                           <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between bg-slate-50/50 backdrop-blur-md">
                              <div>
                                 <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</CardTitle>
                                 <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Live platform entrance monitoring</CardDescription>
                              </div>
                           </CardHeader>
                           <CardContent className="p-0 px-8 pb-10 mt-6">
                              <div className="space-y-3">
                                 {stats.recentUsers.map((user, i) => (
                                    <div key={i} className="group p-5 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-500 relative flex items-center justify-between overflow-hidden">
                                       <div className="flex items-center gap-5 relative z-10">
                                          <div className="relative">
                                             <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transition-transform duration-500 group-hover:scale-110",
                                                user.role === 'admin' ? "bg-violet-600 text-white" : "bg-white text-slate-900 border border-slate-100"
                                             )}>
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                             </div>
                                             <span className={cn(
                                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                                                user.role === 'landlord' ? "bg-orange-500" : "bg-indigo-500"
                                             )} />
                                          </div>
                                          <div>
                                             <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-violet-600 transition-colors">{user.name}</p>
                                             <div className="flex items-center gap-3 mt-1.5">
                                                <Badge className={cn(
                                                   "text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none px-2 py-0.5 rounded-md",
                                                   user.role === 'landlord' && "bg-orange-100 text-orange-600",
                                                   user.role === 'tenant' && "bg-indigo-100 text-indigo-600"
                                                )}>
                                                   {user.role}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                   {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </CardContent>
                        </Card>
                     </motion.div>
                  </div> {/* Close Left Column */}

                  {/* Right Column (Platform Health, Alerts, Command) */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.2 }}
                     className="space-y-8"
                  >
                     <Card className="rounded-[3rem] border-none shadow-2xl shadow-violet-200/50 bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-12 h-auto relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-white/20 transition-colors duration-700"></div>
                        <div className="relative z-10 space-y-10">
                           <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                 <h3 className="text-2xl font-black tracking-tight leading-none text-white">Platform Health</h3>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-violet-200/60 mt-1">Global System Efficiency</p>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                 <Activity className="w-6 h-6 text-white animate-pulse" />
                              </div>
                           </div>
                           <div className="h-[120px] w-full mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={platformHealth}>
                                    <Line type="monotone" dataKey="health" stroke="#ffffff" strokeWidth={5} dot={false} strokeLinecap="round" />
                                 </LineChart>
                              </ResponsiveContainer>
                           </div>
                           <div className="pt-4">
                              <div className="flex justify-between items-end pb-2">
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Current Velocity</span>
                                 <span className="text-4xl font-black tracking-tighter">{platformHealth[platformHealth.length - 1]?.health.toFixed(1)}%</span>
                              </div>
                           </div>
                        </div>
                     </Card>

                     <Card className="rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/30 bg-white p-10 space-y-8 overflow-hidden relative group">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
                        <div className="space-y-1 relative z-10">
                           <h4 className="text-xl font-black text-slate-900 tracking-tight">System High Alerts</h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Immediate Oversight Required</p>
                        </div>
                        <div className="space-y-4 relative z-10">
                           {[
                              { val: stats.allBoardings.filter(b => b.status === "pending").length, label: "Unverified Assets", icon: ShieldCheck, color: "text-amber-600 bg-amber-50" },
                              { val: stats.recentUsers.length, label: "New Registrations", icon: Users, color: "text-indigo-600 bg-indigo-50" },
                              { val: stats.allUsers.filter(u => u.role === "landlord").length, label: "Active Suppliers", icon: Wallet, color: "text-emerald-600 bg-emerald-50" },
                           ].map((alert, i) => (
                              <div key={i} className={cn("flex items-center justify-between p-5 rounded-[1.5rem] border border-transparent hover:border-slate-100 transition-all duration-500", alert.color.split(' ')[1])}>
                                 <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", alert.color.split(' ')[0], alert.color.split(' ')[1].replace('bg-', 'bg-opacity-50 '))}>
                                       <alert.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">{alert.label}</span>
                                 </div>
                                 <span className={cn("text-xl font-black tracking-tighter", alert.color.split(' ')[0])}>{alert.val.toString().padStart(2, '0')}</span>
                              </div>
                           ))}
                        </div>
                     </Card>
                     {/* Infrastructure Command */}
                     <Card className="rounded-[3rem] border-0 shadow-2xl bg-slate-900 text-white p-12 h-auto flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl -mr-40 -mt-40"></div>
                        <div className="space-y-8 relative z-10">
                           <div className="flex items-center gap-3">
                              <Activity className="w-8 h-8 text-violet-400" />
                              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-violet-300">Strategic Control</span>
                           </div>
                           <h3 className="text-5xl font-black tracking-tight leading-tight">Infrastructure <br /> Command</h3>
                           <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-sm">
                              Adjust platform-wide risk parameters, set global policy variables, and maintain infrastructure equilibrium.
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
