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
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBookings } from "@/api/bookings";
import { format } from "date-fns";



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

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Stays</h1>
                        <p className="text-slate-500 font-bold text-lg">Manage your active boardings and lease history.</p>
                    </div>
                </motion.div>

                <Tabs defaultValue="active" className="w-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <TabsList className="bg-white p-1.5 rounded-2xl sm:rounded-[1.5rem] shadow-sm mb-8 sm:mb-10 border border-slate-100 h-auto sm:h-16 w-full max-w-2xl flex flex-col sm:flex-row gap-1">
                            <TabsTrigger value="active" className="rounded-xl px-4 sm:px-10 py-2.5 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                Active Stays
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="rounded-xl px-4 sm:px-10 py-2.5 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                Pending Requests
                            </TabsTrigger>
                            <TabsTrigger value="past" className="rounded-xl px-4 sm:px-10 py-2.5 sm:py-0 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white h-10 sm:h-full transition-all flex-1">
                                History
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
                                {!loading && bookingsList.filter(b => b.status === "approved").length === 0 && (
                                    <div className="py-16 sm:py-20 text-center bg-white rounded-3xl sm:rounded-[3rem] border border-dashed border-slate-200 p-6">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3 tracking-tight">No Active Stays</h3>
                                        <p className="text-slate-400 font-bold text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">You do not have any currently active, approved leases at the moment.</p>
                                    </div>
                                )}
                                {!loading && bookingsList.filter(b => b.status === "approved").map((booking) => (
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
                                                                        {format(new Date(booking.checkInDate), "MMM dd, yyyy")} (For {booking.durationMonths} Months)
                                                                    </div>
                                                                </div>
                                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Monthly Rent</p>
                                                                    <div className="flex items-center gap-3 font-black text-slate-700 text-xs sm:text-sm">
                                                                        <CreditCard className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                        Rs. {(booking.payment?.amount / booking.durationMonths || 0).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 sm:pt-8 border-t border-slate-50">
                                                            <Link to="/contact" className="w-full sm:w-auto">
                                                                <Button variant="outline" className="rounded-2xl border-slate-100 font-black h-11 sm:h-12 px-6 sm:px-8 gap-3 bg-white hover:bg-slate-50 transition-all text-xs sm:text-sm active:scale-95 text-slate-600 w-full">
                                                                    <MessageSquare className="w-4 h-4" /> Message Landlord
                                                                </Button>
                                                            </Link>
                                                            <Link to={`/boarding/${booking.boarding?._id}`} className="w-full sm:w-auto">
                                                                <Button variant="ghost" className="rounded-2xl font-black text-primary hover:bg-primary/5 transition-all gap-2 text-xs sm:text-sm w-full justify-center">
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
                                {!loading && bookingsList.filter(b => b.status === "pending").length === 0 && (
                                    <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <AlertCircle className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Pending Requests</h3>
                                        <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">You do not have any lease applications awaiting landlord approval.</p>
                                    </div>
                                )}
                                {!loading && bookingsList.filter(b => b.status === "pending").map((booking) => (
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
                                {!loading && bookingsList.filter(b => ["rejected", "cancelled", "completed"].includes(b.status)).map((booking) => (
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
                                {!loading && bookingsList.filter(b => ["rejected", "cancelled", "completed"].includes(b.status)).length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200"
                                    >
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <History className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No history recorded</h3>
                                        <p className="text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">Your stay history and finalized lease agreements will appear here safely.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </TabsContent>
                </Tabs>
            </main>
        </div>
    </div>
    );
}
