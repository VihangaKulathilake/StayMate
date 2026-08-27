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
import DynamicSearchInput from "@/components/common/DynamicSearchInput";

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
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

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

  const filteredPayments = paymentsList.filter(item => {
    const matchesSearch = 
      (item.boarding?.boardingName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.transactionId || item._id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.billingMonth || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.booking?.room?.roomNumber ? `room ${item.booking.room.roomNumber}` : "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "pending") return matchesSearch && item.status === "pending";
    if (statusFilter === "completed") return matchesSearch && item.status === "completed";
    if (statusFilter === "overdue") {
      const isOverdue = item.status === 'pending' && item.dueDate && new Date(item.dueDate) < new Date();
      return matchesSearch && isOverdue;
    }
    return matchesSearch;
  });

  const role = getCurrentUser()?.role || 'tenant';
  const Navbar = role === 'tenant' ? UserNavbar : AdminNavbar;
  const SelectedSidebar = role === 'tenant' ? UserSidebar : Sidebar;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <SelectedSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-12 space-y-8 sm:space-y-12 overflow-y-auto min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-[0.2em] text-[10px]">
                <Wallet className="w-3.5 h-3.5" />
                {role === 'tenant' ? 'Ledger & Billings' : 'Revenue Operations'}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mt-2">
                {role === 'tenant' ? 'My ' : 'Financial '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  {role === 'tenant' ? 'Payments' : 'Overview'}
                </span>
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-lg">
                {role === 'tenant'
                  ? 'Track your security deposits, rent cycles, and digital payment receipts securely.'
                  : 'Monitor your collection velocity, manage multi-property invoices, and export fiscal reporting.'}
              </p>
            </div>

            {/* In-Page Dynamic Search Input */}
            <div className="w-full sm:w-80">
              <DynamicSearchInput
                placeholder="Search invoices or properties..."
                value={searchTerm}
                onChange={setSearchTerm}
                results={filteredPayments}
                inputClassName="h-12 border-slate-200 shadow-sm rounded-2xl font-semibold text-xs sm:text-sm focus-visible:ring-emerald-500/20"
                emptyMessage="No invoices match your search."
                renderItem={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-xs truncate">
                          {item.boarding?.boardingName || "Property Stay"}
                        </span>
                        {item.billingMonth && (
                          <Badge className="text-[8px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-none font-bold uppercase">
                            {item.billingMonth}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        REF: {item.transactionId || item._id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-xs font-black text-slate-900 block">
                        Rs. {item.amount?.toLocaleString()}
                      </span>
                      <Badge className={`text-[8px] px-1.5 py-0 border-none font-black uppercase ${
                        item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                )}
                onSelect={(item) => {
                  if (role === 'tenant' && item.status === 'pending') {
                    setSelectedPayment(item);
                    setPayModalOpen(true);
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Revenue Cards */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
          >
            {[
              { label: role === 'tenant' ? "Total Paid" : "Total Collected", val: `Rs. ${summary.collected.toLocaleString()}`, growth: role === 'tenant' ? "Settled" : "Completed", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
              { label: role === 'tenant' ? "Outstanding Dues" : "Pending Funds", val: `Rs. ${summary.pending.toLocaleString()}`, growth: role === 'tenant' ? "Outstanding" : "Pending", icon: Clock3, bg: "bg-amber-50", text: "text-amber-600" },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="rounded-3xl sm:rounded-[2.5rem] border-0 shadow-lg shadow-slate-200/40 bg-white p-5 sm:p-8 group hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <Badge className={`${stat.bg} ${stat.text} border-none font-black text-[9px] sm:text-[10px] rounded-lg px-2.5 py-1`}>{stat.growth}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {[
                { id: 'all', label: 'All Invoices' },
                { id: 'pending', label: 'Pending Dues' },
                { id: 'completed', label: 'Settled / Paid' },
                { id: 'overdue', label: 'Overdue' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all ${
                    statusFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-400 px-3">
              {filteredPayments.length} Record{filteredPayments.length !== 1 ? 's' : ''} Found
            </span>
          </div>

          {/* Transaction Ledger */}
          <Card className="rounded-3xl sm:rounded-[3rem] border-0 shadow-2xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Recent Invoices</CardTitle>
                <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-1">Audit-ready transaction history {role === 'tenant' ? 'for your leases' : 'across assets'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-10 pt-0 sm:pt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3 sm:space-y-4"
              >
                {loading && <p className="text-center p-8 sm:p-12 text-slate-400 font-bold">Sequencing ledger data...</p>}
                {error && <p className="text-center p-8 sm:p-12 text-rose-500 font-bold">{error}</p>}
                {!loading && !error && filteredPayments.length === 0 && (
                  <div className="text-center p-8 sm:p-12 space-y-2">
                    <p className="text-slate-500 font-bold text-sm">No transactions match your search or filter.</p>
                    {searchTerm && (
                      <Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }} className="text-emerald-600 font-bold text-xs">
                        Clear Search & Filters
                      </Button>
                    )}
                  </div>
                )}
                {filteredPayments.map((item) => {
                  const isOverdue = item.status === 'pending' && item.dueDate && new Date(item.dueDate) < new Date();
                  const dueDateFormatted = item.dueDate ? format(new Date(item.dueDate), "MMM dd, yyyy") : null;
                  const paidDateFormatted = item.paidAt ? format(new Date(item.paidAt), "MMM dd, yyyy") : null;

                  return (
                    <motion.div 
                      key={item._id} 
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6 bg-slate-50/40 group hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-sm flex items-center justify-center shrink-0 transition-colors ${
                            item.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-slate-900 text-base sm:text-lg leading-tight uppercase tracking-tight truncate">
                                {item.boarding?.boardingName || "Property Stay"}
                              </h4>
                              {item.billingMonth && (
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-black text-[9px] uppercase tracking-wider px-2 py-0.5">
                                  {item.billingMonth}
                                </Badge>
                              )}
                              {item.type === 'first_month' && (
                                <Badge className="bg-purple-50 text-purple-700 border-purple-100 font-black text-[9px] uppercase tracking-wider px-2 py-0.5">
                                  1st Month Move-In
                                </Badge>
                              )}
                            </div>
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                              REF: {item.transactionId || item._id.substring(0, 8)} • {item.boarding?.city || "Stay"} {item.booking?.room?.roomNumber ? `• RM ${item.booking.room.roomNumber}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-4 sm:gap-8 border-t xl:border-t-0 pt-4 xl:pt-0 w-full xl:w-auto">
                          <div className="space-y-1">
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {item.status === 'completed' ? 'Settled On' : 'Due Date'}
                            </p>
                            <p className={`font-bold text-xs sm:text-sm ${isOverdue ? 'text-rose-600 font-black' : 'text-slate-700'}`}>
                              {item.status === 'completed' && paidDateFormatted ? paidDateFormatted : dueDateFormatted || format(new Date(item.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                            <p className="font-black text-slate-900 text-base sm:text-lg">Rs. {item.amount?.toLocaleString()}</p>
                          </div>

                          <div>
                            {isOverdue ? (
                              <Badge className="font-black tracking-widest text-[9px] sm:text-[10px] rounded-lg px-2.5 py-1 border-none uppercase bg-rose-50 text-rose-600">
                                Overdue
                              </Badge>
                            ) : (
                              <Badge className={`font-black tracking-widest text-[9px] sm:text-[10px] rounded-lg px-2.5 py-1 border-none uppercase ${
                                item.status === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : item.status === 'failed' 
                                  ? 'bg-rose-50 text-rose-600' 
                                  : 'bg-amber-50 text-amber-600'
                              }`}>
                                {item.status === 'completed' ? 'Paid' : item.status}
                              </Badge>
                            )}
                          </div>

                          {role !== 'tenant' && item.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item._id, 'completed'); }} 
                                className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white font-bold text-xs transition-colors"
                              >
                                Mark Paid
                              </Button>
                              <Button 
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(item._id, 'failed'); }} 
                                variant="ghost" 
                                className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-slate-400 font-bold text-xs hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : role === 'tenant' && item.status === 'pending' ? (
                            <Button 
                              onClick={(e) => { e.stopPropagation(); setSelectedPayment(item); setPayModalOpen(true); }}
                              className="h-9 sm:h-10 px-5 sm:px-6 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all duration-300 active:scale-95"
                            >
                              Pay Rent
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
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
