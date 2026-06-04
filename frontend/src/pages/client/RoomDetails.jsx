import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Home, MapPin, Search, Calendar, DoorOpen, X, Info, ChevronLeft, ChevronRight, Layout, Wifi, Wind, Car, BookOpen, Bath, Coffee, Shirt, Shield, Droplets, Bus, VolumeX, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBoardingById } from '@/api/boardings';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import BookingModal from '../../components/booking/BookingModal';
import ErrorPage from '../../components/common/ErrorPage';

const fadeInUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function RoomDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: boardingId, roomId } = useParams();

    const [room, setRoom] = useState(location.state?.room || null);
    const [boarding, setBoarding] = useState(location.state?.boarding || null);
    const [isLoading, setIsLoading] = useState(!location.state?.room);

    const [selectedImage, setSelectedImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!room || !boarding) {
            const fetchRoomData = async () => {
                try {
                    const fetchedBoarding = await getBoardingById(boardingId);
                    setBoarding(fetchedBoarding);
                    const fetchedRoom = fetchedBoarding.rooms?.find(r => String(r._id) === String(roomId));
                    setRoom(fetchedRoom || null);
                } catch (error) {
                    console.error("Failed to fetch room deep link data:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRoomData();
        }
    }, [boardingId, roomId]);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    if (isLoading) {
        return (
            <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
                <UserNavbar />
                <div className="flex-grow flex flex-col items-center justify-center">
                    <motion.div
                        animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-black tracking-[0.2em] text-sm uppercase">Loading Room Details</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (!room || !boarding) {
        return (
            <ErrorPage
                title="Room Context Lost"
                message="We lost the connection to this room's data. Please navigate back to the property and try again."
                redirectPath="/marketplace"
                redirectText="Back to Marketplace"
                code="STATE_ERROR"
            />
        );
    }

    const images = room.images && room.images.length > 0 ? room.images : ['https://images.unsplash.com/photo-1598928506311-c55dd1b31110?w=1200&auto=format&fit=crop&q=80'];

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                    {/* Header Nav */}
                    <div className="flex items-center justify-between mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-black uppercase text-xs tracking-widest rounded-2xl group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Property
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12 items-start">
                        {/* Main Content (Left) */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Hero Gallery Carousel Architecture */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full h-[45vh] md:h-[55vh] overflow-hidden rounded-[2.5rem] shadow-xl relative"
                            >
                                <div
                                    className="relative w-full h-full cursor-pointer group bg-slate-900"
                                    onClick={() => setSelectedImage(images[currentImageIndex])}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/30 z-10 pointer-events-none"></div>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={`Room 00${room.roomNumber} - View ${currentImageIndex + 1}`}
                                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105"
                                    />

                                    {/* Carousel Controls */}
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/20"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-black/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/20"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>

                                            {/* Pagination Indicators */}
                                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-sm">
                                                {images.map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Overlay Text */}
                                    <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
                                        <Badge className="bg-white/20 text-white backdrop-blur-md border-white/20 rounded-xl px-4 py-1.5 font-bold mb-3 tracking-widest uppercase text-[10px]">
                                            Room Showcase
                                        </Badge>
                                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                                            Room {room.roomNumber}
                                        </h1>
                                        <div className="flex items-center gap-2 mt-2 text-white/90 font-bold uppercase text-xs tracking-widest shadow-sm">
                                            <MapPin className="w-4 h-4" />
                                            {boarding.boardingName}
                                        </div>
                                    </div>

                                    {/* Hover Search Icon */}
                                    <div className="absolute bottom-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-indigo-600 transition-colors">
                                            <Search className="w-5 h-5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
                                <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                    <Info className="w-8 h-8 text-indigo-500" />
                                    Room Description
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                                    {room.description || "No detailed description provided for this room."}
                                </p>
                            </motion.div>

                            {/* Facilities & Amenities */}
                            {room.facilities && room.facilities.length > 0 && (
                                <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                            <Layout className="w-8 h-8 text-indigo-500" />
                                            Room Features
                                        </div>
                                        <Badge variant="secondary" className="rounded-xl font-bold px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">{room.facilities.length} Included</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {room.facilities.map((amenity, i) => {
                                            const a = amenity.toLowerCase();
                                            let Icon = Zap; let colorClass = "text-amber-500";
                                            if (a.includes('wifi') || a.includes('internet')) { Icon = Wifi; colorClass = "text-indigo-500"; }
                                            else if (a.includes('ac') || a.includes('air')) { Icon = Wind; colorClass = "text-cyan-500"; }
                                            else if (a.includes('park') || a.includes('garage')) { Icon = Car; colorClass = "text-rose-500"; }
                                            else if (a.includes('desk') || a.includes('study')) { Icon = BookOpen; colorClass = "text-blue-500"; }
                                            else if (a.includes('bath')) { Icon = Bath; colorClass = "text-teal-500"; }
                                            else if (a.includes('kitchen') || a.includes('cook')) { Icon = Coffee; colorClass = "text-orange-500"; }
                                            else if (a.includes('laundry') || a.includes('iron')) { Icon = Shirt; colorClass = "text-pink-500"; }
                                            else if (a.includes('security') || a.includes('cctv')) { Icon = Shield; colorClass = "text-slate-700"; }
                                            else if (a.includes('water') || a.includes('filter')) { Icon = Droplets; colorClass = "text-sky-500"; }
                                            else if (a.includes('entrance') || a.includes('door')) { Icon = DoorOpen; colorClass = "text-emerald-600"; }
                                            else if (a.includes('bus') || a.includes('route')) { Icon = Bus; colorClass = "text-yellow-500"; }
                                            else if (a.includes('quiet') || a.includes('environment')) { Icon = VolumeX; colorClass = "text-purple-500"; }

                                            return (
                                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 drop-shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                        <Icon className={`w-5 h-5 ${colorClass}`} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700 capitalize">{amenity.replace('_', ' ')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Booking Sidebar (Right) */}
                        <div className="lg:col-span-1 h-full">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="sticky top-28 space-y-6"
                            >
                                <div className="border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[2.5rem] bg-white overflow-hidden p-8">
                                    <div className="flex items-end gap-1.5 mb-4">
                                        <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Rs. {room.price?.toLocaleString()}</span>
                                        <span className="text-slate-400 font-bold mb-1.5 md:mb-2 uppercase text-xs tracking-widest">/month</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <Badge variant="outline" className={`border-emerald-200 bg-emerald-50 text-emerald-700 font-black px-3 py-1 text-[10px] tracking-widest uppercase`}>
                                            <DoorOpen className="w-3.5 h-3.5 mr-1.5" /> Available Now
                                        </Badge>
                                        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-black px-3 py-1 text-[10px] tracking-widest uppercase">
                                            <Users className="w-3.5 h-3.5 mr-1.5" /> {room.capacity} Person{room.capacity > 1 ? 's' : ''}
                                        </Badge>
                                    </div>

                                    <hr className="border-slate-100 mb-8" />

                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 text-lg flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-5 h-5" /> Reserve This Room
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4">
                                        Instant local confirmation
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </main>
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                boarding={boarding}
                room={room}
            />

            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-10 h-10" />
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            src={selectedImage}
                            alt="Expanded View"
                            className="max-w-full max-h-full rounded-[2.5rem] shadow-2xl border-4 border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
