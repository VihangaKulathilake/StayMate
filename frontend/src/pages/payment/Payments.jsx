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


          </motion.div>

          {/* Revenue Cards */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              { label: role === 'tenant' ? "Total Paid" : "Total Collected", val: `Rs. ${summary.collected.toLocaleString()}`, growth: role === 'tenant' ? "Settled" : "Completed", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: role === 'tenant' ? "Outstanding Dues" : "Pending Funds", val: `Rs. ${summary.pending.toLocaleString()}`, growth: role === 'tenant' ? "Outstanding" : "Pending", icon: Clock3, bg: "bg-amber-50", text: "text-amber-600" },
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
             </CardContent>
           </Card>
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
