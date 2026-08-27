import React from 'react';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    FileText,
    MessageSquare,
    ExternalLink,
    ChevronRight,
    Home,
    History,
    ArrowUpRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getBookings, requestStayExtension } from "@/api/bookings";
import { format } from "date-fns";
import DynamicSearchInput from "@/components/common/DynamicSearchInput";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function MyBookings() {
    const [bookingsList, setBookingsList] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Extension Modal State
    const [isExtensionModalOpen, setIsExtensionModalOpen] = React.useState(false);
    const [selectedBookingForExtension, setSelectedBookingForExtension] = React.useState(null);
    const [extensionMonths, setExtensionMonths] = React.useState(1);
    const [extensionReason, setExtensionReason] = React.useState("");
    const [extensionLoading, setExtensionLoading] = React.useState(false);
    const [extensionError, setExtensionError] = React.useState("");
    const [extensionSuccess, setExtensionSuccess] = React.useState(false);

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await getBookings();
            setBookingsList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenExtensionModal = (booking) => {
        setSelectedBookingForExtension(booking);
        setExtensionMonths(1);
        setExtensionReason("");
        setExtensionError("");
        setExtensionSuccess(false);
        setIsExtensionModalOpen(true);
    };

    const handleRequestExtension = async (e) => {
        e.preventDefault();
        if (!selectedBookingForExtension) return;
        try {
            setExtensionLoading(true);
            setExtensionError("");
            await requestStayExtension(selectedBookingForExtension._id, {
                additionalMonths: Number(extensionMonths),
                reason: extensionReason,
            });
            setExtensionSuccess(true);
            fetchBookings();
            setTimeout(() => {
                setIsExtensionModalOpen(false);
                setExtensionSuccess(false);
                setSelectedBookingForExtension(null);
            }, 1800);
        } catch (err) {
            setExtensionError(err.message || "Failed to submit extension request.");
        } finally {
            setExtensionLoading(false);
        }
    };

    const filteredBookings = bookingsList.filter((b) => {
        const query = searchTerm.toLowerCase();
        return (
            (b.boarding?.boardingName || "").toLowerCase().includes(query) ||
            (b.boarding?.address || "").toLowerCase().includes(query) ||
            (b.boarding?.city || "").toLowerCase().includes(query) ||
            (b.id || b._id || "").toLowerCase().includes(query) ||
            (b.room?.roomNumber ? `room ${b.room.roomNumber}` : "").toLowerCase().includes(query)
        );
    });

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
                >
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">My Stays</h1>
                        <p className="text-slate-500 font-bold text-sm sm:text-base">Manage your active boardings, lease extensions, and history.</p>
                    </div>

                    {/* Contextual In-Page Dynamic Search */}
                    <div className="w-full sm:w-80">
                        <DynamicSearchInput
                            placeholder="Search stays, rooms, or cities..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            results={filteredBookings}
                            inputClassName="h-11 rounded-2xl border-slate-200 shadow-sm font-semibold text-xs sm:text-sm focus-visible:ring-indigo-500/20"
                            emptyMessage="No stays match your search."
                            renderItem={(item) => (
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-black text-slate-900 text-xs truncate">
                                                {item.boarding?.boardingName}
                                            </span>
                                            {item.room?.roomNumber && (
                                                <Badge className="text-[8px] px-1.5 py-0 bg-indigo-50 text-indigo-700 border-none font-bold uppercase">
                                                    RM {item.room.roomNumber}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">
                                            {item.boarding?.city || item.boarding?.address || "Stay"} • {format(new Date(item.checkInDate), "MMM yyyy")}
                                        </p>
                                    </div>
                                    <Badge className={`text-[8px] px-1.5 py-0 border-none font-black uppercase shrink-0 ${
                                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : item.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {item.status}
                                    </Badge>
                                </div>
                            )}
                            onSelect={() => {
                                // Keeps search query filtered to that item
                            }}
                        />
                    </div>
                </motion.div>

                <Tabs defaultValue="active" className="w-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <TabsList className="bg-white p-1.5 rounded-2xl sm:rounded-[1.5rem] shadow-sm mb-8 sm:mb-10 border border-slate-100 h-auto sm:h-14 w-full max-w-xl flex flex-col sm:flex-row gap-1">
                            <TabsTrigger value="active" className="rounded-xl px-4 sm:px-8 py-2 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                Active Stays ({filteredBookings.filter(b => b.status === "approved").length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-xl px-4 sm:px-8 py-2 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                Pending ({filteredBookings.filter(b => b.status === "pending").length})
                            </TabsTrigger>
                            <TabsTrigger value="past" className="rounded-xl px-4 sm:px-8 py-2 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                History ({filteredBookings.filter(b => ["rejected", "cancelled", "completed"].includes(b.status)).length})
                            </TabsTrigger>
                        </TabsList>
                    </motion.div>

                        <TabsContent value="active" className="space-y-8 outline-none mt-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-6"
                            >
                                {loading && <p className="text-center p-12 text-slate-400 font-bold">Sequencing active stay data...</p>}
                                {!loading && filteredBookings.filter(b => b.status === "approved").length === 0 && (
                                    <div className="py-16 sm:py-20 text-center bg-white rounded-3xl sm:rounded-[3rem] border border-dashed border-slate-200 p-6">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">
                                            {searchTerm ? "No Matching Active Stays" : "No Active Stays"}
                                        </h3>
                                        <p className="text-slate-400 font-bold text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
                                            {searchTerm ? "Try searching for a different property or keyword." : "You do not have any currently active, approved leases at the moment."}
                                        </p>
                                    </div>
                                )}
                                {!loading && filteredBookings.filter(b => b.status === "approved").map((booking) => (
                                    <motion.div key={booking._id} variants={itemVariants} initial="hidden" animate="visible">
                                        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl sm:rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 group">
                                            <CardContent className="p-0">
                                                <div className="flex flex-col lg:flex-row">
                                                    <div className="lg:w-80 h-48 sm:h-64 lg:h-auto overflow-hidden relative">
                                                        <img src={booking.boarding?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=60"} alt={booking.boarding?.boardingName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                                                            <Badge className="bg-emerald-500 text-white border-none font-black px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-widest shadow-lg">
                                                                {booking.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex-grow p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{booking.id}</span>
                                                                <Button variant="ghost" size="icon" className="rounded-full text-slate-300 hover:text-primary">
                                                                    <ArrowUpRight className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">{booking.boarding?.boardingName} {booking.room ? `- Room ${booking.room.roomNumber}` : ""}</h3>
                                                            <div className="flex items-center gap-2 text-slate-400 font-bold mb-6 sm:mb-8 text-xs sm:text-sm">
                                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                                {booking.boarding?.address || "Location Hidden"}
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lease Period</p>
                                                                    <div className="flex items-center gap-3 font-black text-slate-700 text-xs sm:text-sm">
                                                                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                                                                        {format(new Date(booking.checkInDate), "MMM dd, yyyy")} ({booking.durationMonths} Months)
                                                                    </div>
                                                                </div>
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Rent</p>
                                                                    <div className="flex items-center gap-3 font-black text-slate-700 text-xs sm:text-sm">
                                                                        <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                        Rs. {(booking.monthlyRent || (booking.payment?.amount ? (booking.payment.amount / booking.durationMonths) : 0)).toLocaleString()} / mo
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Extension Request Status Banner */}
                                                            {booking.extensionRequest?.status === "pending" && (
                                                                <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1 text-xs">
                                                                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[10px] text-amber-700">
                                                                        <Clock className="w-3.5 h-3.5" /> Extension Request Pending Review
                                                                    </div>
                                                                    <p className="font-bold">
                                                                        Requested <span className="underline font-black">+{booking.extensionRequest.additionalMonths} Month(s)</span> extension on {booking.extensionRequest.requestedAt ? format(new Date(booking.extensionRequest.requestedAt), "MMM dd, yyyy") : "recently"}.
                                                                    </p>
                                                                    {booking.extensionRequest.reason && (
                                                                        <p className="text-amber-700/80 italic font-medium text-[11px]">"{booking.extensionRequest.reason}"</p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {booking.extensionRequest?.status === "rejected" && (
                                                                <div className="mb-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 space-y-1 text-xs">
                                                                    <p className="font-black uppercase tracking-wider text-[10px] text-slate-500">Extension Request Declined</p>
                                                                    <p className="font-medium text-slate-600">
                                                                        {booking.extensionRequest.landlordNote || "The landlord could not accommodate the extension for this stay."}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 sm:pt-8 border-t border-slate-50 flex-wrap">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <Button 
                                                                    onClick={() => handleOpenExtensionModal(booking)}
                                                                    disabled={booking.extensionRequest?.status === "pending"}
                                                                    className="rounded-2xl font-black h-11 sm:h-12 px-5 gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition-all text-xs active:scale-95 shadow-sm"
                                                                >
                                                                    <Clock className="w-4 h-4" /> 
                                                                    {booking.extensionRequest?.status === "pending" ? "Extension Pending" : "Request Stay Extension"}
                                                                </Button>
                                                                <Link to="/payments">
                                                                    <Button variant="outline" className="rounded-2xl border-slate-200 font-bold h-11 sm:h-12 px-5 gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs">
                                                                        <CreditCard className="w-4 h-4 text-emerald-600" /> Payment Ledger
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                            <Link to={`/boarding/${booking.boarding?._id}`}>
                                                                <Button variant="ghost" className="rounded-2xl font-black text-primary hover:bg-primary/5 transition-all gap-2 text-xs sm:text-sm">
                                                                    Property Details <ChevronRight className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="pending" className="space-y-6 outline-none mt-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {loading && <p className="text-center p-12 text-slate-400 font-bold">Scanning pending requests...</p>}
                                {!loading && filteredBookings.filter(b => b.status === "pending").length === 0 && (
                                    <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <AlertCircle className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                            {searchTerm ? "No Matching Pending Requests" : "No Pending Requests"}
                                        </h3>
                                        <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                                            {searchTerm ? "No pending lease requests match your search criteria." : "You do not have any lease applications awaiting landlord approval."}
                                        </p>
                                    </div>
                                )}
                                {!loading && filteredBookings.filter(b => b.status === "pending").map((booking) => (
                                    <motion.div key={booking._id} variants={itemVariants} initial="hidden" animate="visible">
                                        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem] opacity-90 hover:opacity-100 transition-all hover:shadow-xl duration-500">
                                            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                                                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner">
                                                    <img src={booking.boarding?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=60"} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow text-center md:text-left">
                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                                        <h3 className="text-2xl font-black text-slate-900">{booking.boarding?.boardingName}</h3>
                                                        <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[10px] uppercase tracking-widest px-3">Reviewing Application</Badge>
                                                    </div>
                                                    <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2">
                                                        <MapPin className="w-4 h-4 text-primary" /> {booking.boarding?.address || "Location Hidden"}
                                                    </p>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="past" className="outline-none mt-0">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-4"
                            >
                                {loading && <p className="text-center p-12 text-slate-400 font-bold">Retrieving history logs...</p>}
                                {!loading && filteredBookings.filter(b => ["rejected", "cancelled", "completed"].includes(b.status)).map((booking) => (
                                    <motion.div key={booking._id} variants={itemVariants} initial="hidden" animate="visible">
                                        <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem] hover:shadow-xl transition-all duration-500">
                                            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner grayscale">
                                                    <img src={booking.boarding?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=60"} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow text-center md:text-left">
                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                                        <h3 className="text-2xl font-black text-slate-900 line-through decoration-slate-300">{booking.boarding?.boardingName}</h3>
                                                        <Badge className={`border-none font-black text-[10px] uppercase tracking-widest px-3 ${booking.status === 'rejected' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{booking.status}</Badge>
                                                    </div>
                                                    <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2">
                                                        <MapPin className="w-4 h-4 text-slate-300" /> {booking.boarding?.address || "Location Hidden"}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                                {!loading && filteredBookings.filter(b => ["rejected", "cancelled", "completed"].includes(b.status)).length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200"
                                    >
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <History className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                            {searchTerm ? "No Matching History Found" : "No history recorded"}
                                        </h3>
                                        <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                                            {searchTerm ? "No archived or completed records match your search." : "Your stay history and finalized lease agreements will appear here safely."}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </TabsContent>
                </Tabs>
            </main>
        </div>

        {/* Stay Extension Request Dialog */}
        <Dialog open={isExtensionModalOpen} onOpenChange={setIsExtensionModalOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
                <DialogHeader className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto sm:mx-0">
                        <Clock className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-slate-900">
                        Request Stay Extension
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium text-xs leading-relaxed">
                        Submit a formal request to your landlord to extend your lease at <span className="font-bold text-slate-900">{selectedBookingForExtension?.boarding?.boardingName}</span>.
                    </DialogDescription>
                </DialogHeader>

                {extensionSuccess ? (
                    <div className="py-6 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-slate-900">Extension Request Sent!</h4>
                        <p className="text-xs text-slate-500 font-medium">Your landlord has been notified. You will see updates on this dashboard once reviewed.</p>
                    </div>
                ) : (
                    <form onSubmit={handleRequestExtension} className="space-y-4 pt-2">
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>Current Monthly Rent</span>
                            <span className="text-indigo-700 font-black text-sm">
                                Rs. {(selectedBookingForExtension?.monthlyRent || (selectedBookingForExtension?.payment?.amount / selectedBookingForExtension?.durationMonths) || 0).toLocaleString()} / mo
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Additional Months Requested
                            </label>
                            <Input 
                                type="number" 
                                min="1" 
                                max="24"
                                value={extensionMonths} 
                                onChange={(e) => setExtensionMonths(e.target.value)} 
                                className="h-12 rounded-xl font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Note / Reason for Landlord (Optional)
                            </label>
                            <Textarea 
                                placeholder="E.g., My semester was extended by 2 months, would like to renew our agreement..."
                                value={extensionReason}
                                onChange={(e) => setExtensionReason(e.target.value)}
                                className="min-h-[90px] rounded-xl resize-none text-xs"
                            />
                        </div>

                        {extensionError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                                {extensionError}
                            </div>
                        )}

                        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsExtensionModalOpen(false)}
                                className="rounded-xl h-11 font-bold flex-1"
                                disabled={extensionLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="rounded-xl h-11 font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex-1"
                                disabled={extensionLoading}
                            >
                                {extensionLoading ? "Submitting..." : "Send Formal Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    </div>
    );
}
