import React from "react";
import { motion } from "framer-motion";
import {
  Download,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  Wallet
} from "lucide-react";
import { getPayments, updatePaymentStatus } from "@/api/payments";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminNavbar from "@/components/common/AdminNavbar";
import UserNavbar from "@/components/common/UserNavbar";
import Sidebar from "@/components/common/Sidebar";
import UserSidebar from "@/components/common/UserSidebar";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import PayModal from "@/components/payment/PayModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function Payments() {
  const [paymentsList, setPaymentsList] = React.useState([]);
  const [summary, setSummary] = React.useState({ collected: 0, pending: 0, overdue: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState(null);

  React.useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getPayments();
      setPaymentsList(data);

      const collected = data.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.amount || 0), 0);
      const pending = data.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.amount || 0), 0);

      setSummary({ collected, pending, overdue: 0 });
    } catch (err) {
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updatePaymentStatus(id, newStatus);
      fetchPayments(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const role = getCurrentUser()?.role || 'tenant';
  const Navbar = role === 'tenant' ? UserNavbar : AdminNavbar;
  const SelectedSidebar = role === 'tenant' ? UserSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SelectedSidebar />
        <main className="flex-1 p-6 lg:p-12 space-y-12 overflow-y-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Wallet className="w-3 h-3" />
                {role === 'tenant' ? 'Ledger & Billings' : 'Revenue Operations'}
              </div>
              <h1 className="text-5xl font-black tracking-tight text-slate-900 mt-2">
                {role === 'tenant' ? 'My ' : 'Financial '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  {role === 'tenant' ? 'Payments' : 'Overview'}
                </span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg">
                {role === 'tenant'
                  ? 'Track your security deposits, rent cycles, and digital payment receipts securely.'
                  : 'Monitor your collection velocity, manage multi-property invoices, and export fiscal reporting.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input placeholder="Search invoices..." className="h-12 pl-12 pr-4 rounded-2xl border-none bg-white shadow-lg shadow-slate-200/50 w-64 font-bold" />
              </div>
              <Button className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-black shadow-xl hover:shadow-emerald-200 transition-all active:scale-95">
                <Download className="w-5 h-5 mr-3" /> Export Ledger
              </Button>
            </div>
          </motion.div>

          {/* Revenue Cards */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { label: role === 'tenant' ? "Total Paid" : "Total Collected", val: `Rs. ${summary.collected.toLocaleString()}`, growth: role === 'tenant' ? "Settled" : "+12.4%", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: role === 'tenant' ? "Outstanding Dues" : "Pending Funds", val: `Rs. ${summary.pending.toLocaleString()}`, growth: "Review Required", icon: Clock3, bg: "bg-amber-50", text: "text-amber-600" },
              { label: role === 'tenant' ? "Next Bill Estimate" : "Overdue Leases", val: "Rs. 0", growth: "Safe", icon: AlertTriangle, bg: "bg-slate-50", text: "text-slate-400" },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white p-8 group hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge className={`${stat.bg} ${stat.text} border-none font-black text-[10px] rounded-lg`}>{stat.growth}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Transaction Ledger */}
          <Card className="rounded-[3rem] border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Recent Invoices</CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Audit-ready transaction history {role === 'tenant' ? 'for your leases' : 'across assets'}</CardDescription>
              </div>
              <Button variant="ghost" className="rounded-xl flex items-center gap-2 text-slate-400 font-bold">
                <Filter className="w-4 h-4" /> Filter <ChevronDown className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 px-10 pb-10">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {loading && <p className="text-center p-12 text-slate-400 font-bold">Sequencing ledger data...</p>}
                {error && <p className="text-center p-12 text-rose-500 font-bold">{error}</p>}
                {!loading && !error && paymentsList.length === 0 && <p className="text-center p-12 text-slate-400 font-bold">No transactions recorded.</p>}

                {paymentsList.map((item) => (
                  <motion.div 
                    key={item._id} 
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="rounded-3xl border border-slate-50 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-slate-50/30 group hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">
                            {item.boarding?.boardingName || "Property Payment"}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            REF: {item.transactionId || item._id.substring(0, 8)} • {format(new Date(item.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-10 border-t xl:border-t-0 pt-6 xl:pt-0">
                        <div className="space-y-1 min-w-[120px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Settle Method</p>
                          <p className="font-bold text-slate-700 capitalize">{item.method || 'Digital Record'}</p>
                        </div>
                        <div className="space-y-1 min-w-[120px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Amount</p>
                          <p className="font-black text-slate-900 text-lg">Rs. {item.amount?.toLocaleString()}</p>
                        </div>
                        <div className="min-w-[100px]">
                          <Badge className={`font-black tracking-widest text-[10px] rounded-lg px-3 py-1 border-none uppercase ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : item.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.status}
                          </Badge>
                        </div>
                        {role !== 'tenant' && item.status === 'pending' ? (
                          <div className="flex items-center gap-2 ml-auto">
                            <Button 
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item._id, 'completed'); }} 
                              className="h-9 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold transition-colors"
                            >
                              Approve
                            </Button>
                            <Button 
                              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item._id, 'failed'); }} 
                              variant="ghost" 
                              className="h-9 px-4 rounded-xl text-slate-400 font-bold hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : role === 'tenant' && item.status === 'pending' ? (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); setSelectedPayment(item); setPayModalOpen(true); }}
                            className="ml-auto h-10 px-6 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-md hover:shadow-emerald-100 transition-all duration-300 active:scale-95"
                          >
                            Pay Now
                          </Button>
                        ) : (
                          <Button size="icon" className="h-10 w-10 rounded-xl bg-white text-slate-200 group-hover:text-slate-900 shadow-sm ml-auto">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="mt-8 rounded-3xl bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">Detailed account-level ledger history is optimized in the Admin Console.</p>
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 text-slate-900 font-bold whitespace-nowrap">
                  Platform Audit Report
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Collection Health Widget - Landlords Only */}
          {role !== 'tenant' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-[3rem] bg-slate-900 p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl -mr-40 -mt-40"></div>
              <div className="space-y-6 relative z-10 max-w-md">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Asset Efficiency</span>
                </div>
                <h3 className="text-4xl font-black tracking-tight leading-none">Yield Optimization</h3>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                  Your current collection velocity is <span className="text-white font-bold">82%</span>. Automation of overdue triggers can improve this by roughly <span className="text-emerald-400 font-bold">14.2%</span>.
                </p>
              </div>
              <div className="w-full lg:w-auto bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/5 relative z-10">
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Benchmark</span>
                    <span className="text-2xl font-black">95.0%</span>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[82%]"></div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black hover:bg-slate-100 shadow-2xl group flex items-center justify-center gap-3">
                    Optimize Collection Flow <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
      {payModalOpen && selectedPayment && (
        <PayModal 
          isOpen={payModalOpen}
          onClose={() => { setPayModalOpen(false); setSelectedPayment(null); }}
          payment={selectedPayment}
          onSuccess={() => {
            setPayModalOpen(false);
            setSelectedPayment(null);
            fetchPayments();
          }}
        />
      )}
    </div>
  );
}

function ChevronDown(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
