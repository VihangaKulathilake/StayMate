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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBoardings } from "@/api/boardings";
import { getBookings, respondStayExtension } from "@/api/bookings";
import { format } from "date-fns";
import DynamicSearchInput from "@/components/common/DynamicSearchInput";

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
  const [rawBookings, setRawBookings] = React.useState([]);
  const [summary, setSummary] = React.useState({ pending: 0, maintenance: 0, issues: 0, extensions: 0 });
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterTab, setFilterTab] = React.useState("all");

  // Extension Action State
  const [selectedExtensionBooking, setSelectedExtensionBooking] = React.useState(null);
  const [extensionDecision, setExtensionDecision] = React.useState("approved");
  const [landlordNote, setLandlordNote] = React.useState("");
  const [extensionActionLoading, setExtensionActionLoading] = React.useState(false);
  const [extensionActionError, setExtensionActionError] = React.useState("");

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

      setRawBookings(bookings);

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
      const totalExtensions = bookings.filter(b => b.extensionRequest?.status === 'pending').length;

      setSummary({
        pending: totalPending,
        maintenance: totalActive,
        issues: totalIssues,
        extensions: totalExtensions
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondExtension = async () => {
    if (!selectedExtensionBooking) return;
    try {
      setExtensionActionLoading(true);
      setExtensionActionError("");
      await respondStayExtension(selectedExtensionBooking._id, {
        decision: extensionDecision,
        landlordNote,
      });
      setSelectedExtensionBooking(null);
      fetchOpsData();
    } catch (err) {
      setExtensionActionError(err.message || "Failed to process extension decision.");
    } finally {
      setExtensionActionLoading(false);
    }
  };

  const pendingExtensions = rawBookings.filter(b => b.extensionRequest?.status === 'pending');

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
              <div className="w-full sm:w-72">
                <DynamicSearchInput 
                  placeholder="Search properties or hubs..." 
                  value={searchTerm}
                  onChange={setSearchTerm}
                  results={filteredOpsData}
                  inputClassName="h-12 rounded-xl border-slate-200 shadow-sm font-semibold text-xs sm:text-sm"
                  emptyMessage="No property hubs match your search."
                  renderItem={(item) => (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="font-black text-slate-900 text-xs block">{item.property}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.location}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-indigo-600 block">{item.occupied}</span>
                        <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Occupancy</span>
                      </div>
                    </div>
                  )}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[
              { label: "Pending Requests", count: summary.pending, sub: "Entrance screening", icon: Mail, bg: "bg-indigo-50", text: "text-indigo-600", key: "pending" },
              { label: "Extension Requests", count: summary.extensions, sub: "Lease renewal", icon: Clock3, bg: "bg-purple-50", text: "text-purple-600", key: "extensions" },
              { label: "Active Residents", count: summary.maintenance, sub: "Verified occupancy", icon: ShieldCheck, bg: "bg-emerald-50", text: "text-emerald-600", key: "active" },
              { label: "Closed / Inactive", count: summary.issues, sub: "Past records", icon: AlertTriangle, bg: "bg-slate-50", text: "text-slate-600", key: "all" },
            ].map((action, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card 
                  onClick={() => setFilterTab(action.key)}
                  className={`rounded-2xl sm:rounded-[2rem] border-2 ${filterTab === action.key ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-transparent'} shadow-lg shadow-slate-200/40 bg-white p-5 group hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${action.bg} ${action.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{action.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{action.count}</h3>
                        <p className="text-[11px] font-bold text-slate-500">{action.sub}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.section>

          {/* Pending Extension Review Section */}
          {pendingExtensions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-2xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Badge className="bg-purple-500/30 text-purple-200 border-none font-bold uppercase tracking-wider text-[10px]">
                    Action Required
                  </Badge>
                  <h3 className="text-2xl font-black tracking-tight">Pending Stay Extensions ({pendingExtensions.length})</h3>
                  <p className="text-purple-200 text-xs font-medium">Residents requesting to extend their active stays. Approved extensions automatically append month-by-month installments to the ledger.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingExtensions.map((booking) => (
                  <div key={booking._id} className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-white text-base">{booking.tenant?.name || "Resident"}</h4>
                        <p className="text-xs text-purple-200 font-medium">{booking.boarding?.boardingName} {booking.room ? `• Room ${booking.room.roomNumber}` : ''}</p>
                      </div>
                      <Badge className="bg-emerald-400 text-slate-900 font-black text-xs px-2.5 py-0.5">
                        +{booking.extensionRequest?.additionalMonths} Month(s)
                      </Badge>
                    </div>

                    <div className="text-xs text-purple-100/90 font-medium space-y-1 pt-1 border-t border-white/10">
                      <p><span className="text-purple-300 font-bold">New Lease Term:</span> {booking.durationMonths + booking.extensionRequest?.additionalMonths} Months</p>
                      <p><span className="text-purple-300 font-bold">Monthly Rent:</span> Rs. {(booking.monthlyRent || (booking.payment?.amount / booking.durationMonths) || 0).toLocaleString()} / mo</p>
                      {booking.extensionRequest?.reason && (
                        <p className="italic text-purple-200 text-[11px] pt-1">"{booking.extensionRequest.reason}"</p>
                      )}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedExtensionBooking(booking);
                          setExtensionDecision("approved");
                          setLandlordNote("");
                          setExtensionActionError("");
                        }}
                        className="rounded-xl h-10 px-4 font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs shadow-md flex-1"
                      >
                        Approve Extension
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedExtensionBooking(booking);
                          setExtensionDecision("rejected");
                          setLandlordNote("");
                          setExtensionActionError("");
                        }}
                        variant="outline"
                        className="rounded-xl h-10 px-4 font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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

      {/* Landlord Extension Decision Dialog */}
      <Dialog open={Boolean(selectedExtensionBooking)} onOpenChange={(open) => { if (!open) setSelectedExtensionBooking(null); }}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto sm:mx-0">
              <Clock3 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">
              {extensionDecision === "approved" ? "Approve Stay Extension" : "Decline Stay Extension"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-xs leading-relaxed">
              Reviewing extension for <span className="font-bold text-slate-900">{selectedExtensionBooking?.tenant?.name}</span> at <span className="font-bold text-slate-900">{selectedExtensionBooking?.boarding?.boardingName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 text-xs font-bold text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Extension Requested:</span>
              <span className="text-purple-700 font-black">+{selectedExtensionBooking?.extensionRequest?.additionalMonths} Month(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">New Total Lease:</span>
              <span className="text-slate-900">{(selectedExtensionBooking?.durationMonths || 0) + (selectedExtensionBooking?.extensionRequest?.additionalMonths || 0)} Months</span>
            </div>
            {selectedExtensionBooking?.extensionRequest?.reason && (
              <div className="pt-2 border-t border-purple-100">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Resident's Note</span>
                <p className="text-slate-700 font-medium italic text-[11px]">"{selectedExtensionBooking.extensionRequest.reason}"</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Note to Resident (Optional)
            </label>
            <Textarea
              placeholder={extensionDecision === "approved" ? "E.g., Glad to extend your stay! Your ledger has been updated." : "E.g., Unfortunately, this room has been reserved for the upcoming term."}
              value={landlordNote}
              onChange={(e) => setLandlordNote(e.target.value)}
              className="min-h-[80px] rounded-xl resize-none text-xs"
            />
          </div>

          {extensionActionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {extensionActionError}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedExtensionBooking(null)}
              className="rounded-xl h-11 font-bold flex-1"
              disabled={extensionActionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRespondExtension}
              className={`rounded-xl h-11 font-black text-white shadow-lg flex-1 ${
                extensionDecision === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
              }`}
              disabled={extensionActionLoading}
            >
              {extensionActionLoading ? "Processing..." : extensionDecision === "approved" ? "Confirm Approval" : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
