import React from 'react';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, Wifi, Wind, Car, Zap, CheckCircle2,
    Calendar, Phone, MessageCircle, ArrowLeft, Heart,
    Share2, Info, ChevronLeft, ChevronRight, Search, Home, Layout, Mail, ExternalLink, Activity,
    BookOpen, Bath, Shirt, Droplets, DoorOpen, Bus, VolumeX, Shield, Coffee,
    X, Image as ImageIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useParams } from 'react-router-dom';
import { getBoardingById } from "@/api/boardings";
import BookingModal from '@/components/booking/BookingModal';
import reviewApi from '@/api/review';
import { getBookings } from '@/api/bookings';

// Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

export default function BoardingDetails() {
    const { id } = useParams();
    const [items, setItems] = React.useState([]); // Assuming items is a generic list if used, but let's stick to what's there
    const [boarding, setBoarding] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [activeImage, setActiveImage] = React.useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
    const [selectedRoomToBook, setSelectedRoomToBook] = React.useState(null);
    const [reviews, setReviews] = React.useState([]);
    const [canReview, setCanReview] = React.useState(false);
    const [newRating, setNewRating] = React.useState('');
    const [newComment, setNewComment] = React.useState('');
    const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

    const openBooking = (room = null) => {
        setSelectedRoomToBook(room);
        setIsBookingModalOpen(true);
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const averageRating = reviews.filter(r => r.rating > 0).length > 0
        // explain: 
        // 1. reviews.filter(r => r.rating > 0): Filter out reviews with no rating
        // 2. .reduce((acc, curr) => acc + curr.rating, 0): Sum all the ratings
        // 3. / reviews.filter(r => r.rating > 0).length: Divide by the number of reviews with ratings
        // 4. .toFixed(1): Round to one decimal place
        ? (reviews.filter(r => r.rating > 0).reduce((acc, curr) => acc + curr.rating, 0) / reviews.filter(r => r.rating > 0).length).toFixed(1)
        : null;

    const commentsOnlyReviews = reviews.filter(r => r.comment && r.comment.trim() !== '');

    React.useEffect(() => {
        fetchBoarding();
        fetchReviewsAndCheckStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchReviewsAndCheckStatus = async () => {
        try {
            const fetchedReviews = await reviewApi.getReviewsByBoardingId(id);
            if (Array.isArray(fetchedReviews)) {
                setReviews(fetchedReviews);
            } else {
                setReviews([]);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]);
        }

        try {
            const userBookings = await getBookings();

            const hasActiveBooking = userBookings.some(booking => {
                const bookingBoardingId = booking.boarding?._id || booking.boarding;
                return String(bookingBoardingId) === String(id) && booking.status === 'approved';
            });

            setCanReview(hasActiveBooking);
        } catch (error) {
            console.error("Error fetching user bookings:", error);
        }
    };

    const handleSubmitReview = async () => {
        if (!newRating && !newComment.trim()) return;
        setIsSubmittingReview(true);
        try {
            await reviewApi.createReview({
                boardingId: id,
                rating: newRating,
                comment: newComment
            });
            setNewComment('');
            setNewRating(0);
            const refreshedReviews = await reviewApi.getReviewsByBoardingId(id);
            setReviews(refreshedReviews);
        } catch (error) {
            console.error("Failed to submit review:", error);
            alert("Failed to submit review. Try again.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const fetchBoarding = async () => {
        setLoading(true);
        try {
            const data = await getBoardingById(id);
            setBoarding(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                    animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-black tracking-[0.2em] text-sm uppercase">Loading Property Data</p>
                </motion.div>
            </div>
        </div>
    );

    if (!boarding) return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                    <Home className="w-16 h-16 text-slate-300 mx-auto" />
                    <h2 className="text-2xl font-black text-slate-900">Property Not Found</h2>
                    <div className="h-2"></div>
                    <Link to="/marketplace">
                        <Button className="rounded-xl font-bold px-8">Return to Marketplace</Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    // Map real data intelligently
    const displayPrice = boarding.type === 'room_based' && boarding.rooms?.length > 0
        ? Math.min(...boarding.rooms.map(r => r.price || Infinity).filter(p => p !== Infinity))
        : boarding.price;

    const amenities = boarding.facilities && boarding.facilities.length > 0 ? boarding.facilities : boarding.amenities || [];
    const images = boarding.images && boarding.images.length > 0 ? boarding.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80']; // Only fallback if array is literally empty
    const ownerName = boarding.owner?.name || `${boarding.owner?.firstName || 'Landlord'} ${boarding.owner?.lastName || ''}`.trim();
    const ownerEmail = boarding.owner?.email || "";
    const mapQuery = encodeURIComponent(`${boarding.address}, ${boarding.city}`);

    const renderIcon = (amenity) => {
        const a = amenity.toLowerCase();
        if (a.includes('wifi') || a.includes('internet')) return <Wifi className="w-5 h-5 text-indigo-500" />;
        if (a.includes('ac') || a.includes('air')) return <Wind className="w-5 h-5 text-cyan-500" />;
        if (a.includes('park') || a.includes('garage')) return <Car className="w-5 h-5 text-rose-500" />;
        if (a.includes('desk') || a.includes('study')) return <BookOpen className="w-5 h-5 text-blue-500" />;
        if (a.includes('bath')) return <Bath className="w-5 h-5 text-teal-500" />;
        if (a.includes('kitchen') || a.includes('cook')) return <Coffee className="w-5 h-5 text-orange-500" />;
        if (a.includes('laundry') || a.includes('iron')) return <Shirt className="w-5 h-5 text-pink-500" />;
        if (a.includes('security') || a.includes('cctv')) return <Shield className="w-5 h-5 text-slate-700" />;
        if (a.includes('water') || a.includes('filter')) return <Droplets className="w-5 h-5 text-sky-500" />;
        if (a.includes('entrance') || a.includes('door')) return <DoorOpen className="w-5 h-5 text-emerald-600" />;
        if (a.includes('bus') || a.includes('route')) return <Bus className="w-5 h-5 text-yellow-500" />;
        if (a.includes('quiet') || a.includes('environment')) return <VolumeX className="w-5 h-5 text-purple-500" />;
        return <Zap className="w-5 h-5 text-amber-500" />;
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                    {/* Top Navigation Row */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <Link to="/marketplace" className="no-underline">
                            <Button variant="ghost" className="gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-black uppercase text-xs tracking-widest rounded-2xl group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Search
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="rounded-2xl bg-white border-slate-100 shadow-sm h-11 w-11 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all group">
                                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-2xl bg-white border-slate-100 shadow-sm h-11 w-11 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all group">
                                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12 items-start">

                        {/* Main Content Area (Left col span 2) */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-2 space-y-12"
                        >
                            {/* Cinematic Image Gallery Carousel */}
                            <motion.div variants={fadeInUp} className="w-full h-[45vh] md:h-[55vh] overflow-hidden rounded-[2.5rem] shadow-2xl relative bg-slate-900 group">
                                <div
                                    className="relative w-full h-full cursor-pointer"
                                    onClick={() => setSelectedImage(images[activeImage])}
                                >
                                    <motion.img
                                        key={activeImage}
                                        initial={{ opacity: 0.5, scale: 1.02 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        src={images[activeImage]}
                                        alt={boarding.boardingName}
                                        className="w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/10 z-10 pointer-events-none" />

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
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <div className="absolute bottom-6 left-8 right-8 z-20 pointer-events-none">
                                        <Badge className="bg-white/20 text-white backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-xl text-[10px] tracking-widest uppercase font-black shadow-sm inline-block">
                                            {boarding.type === "full_property" ? "Entire Property" : boarding.type?.replace("_", " ") || "Room Based"}
                                        </Badge>
                                    </div>

                                    {/* Hover Search Icon */}
                                    <div className="absolute bottom-6 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 bg-black/30 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 hover:bg-indigo-600 transition-colors shadow-lg">
                                            <Search className="w-5 h-5 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Title & Core Details */}
                            <motion.div variants={fadeInUp}>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                                    {boarding.boardingName}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-slate-600 font-bold text-sm md:text-base">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        {boarding.address}{boarding.city ? `, ${boarding.city}` : ''}
                                    </div>
                                    <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                        <span>{averageRating ? `${averageRating} (${reviews.filter(r => r.rating > 0).length} ${reviews.filter(r => r.rating > 0).length === 1 ? 'Review' : 'Reviews'})` : "New (0 Reviews)"}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <hr className="border-slate-200" />

                            {/* Dynamic Description Area */}
                            <motion.div variants={fadeInUp} className="space-y-6">
                                <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                    <Info className="w-8 h-8 text-indigo-500" />
                                    About This Property
                                </div>
                                <p className="text-slate-600 leading-relaxed text-lg font-medium whitespace-pre-line">
                                    {boarding.description}
                                </p>
                            </motion.div>

                            {/* Room Selection Area (Only for Room Based) */}
                            {boarding.type === "room_based" && boarding.rooms?.length > 0 && (
                                <motion.div variants={fadeInUp} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                            <DoorOpen className="w-8 h-8 text-indigo-500" />
                                            Available Rooms
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none rounded-xl font-bold px-4 py-1.5 tracking-wide">
                                            {boarding.availableRooms} Vacancies
                                        </Badge>
                                    </div>
                                    <div className="grid gap-4">
                                        {boarding.rooms.map((room, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${room.available
                                                    ? 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10'
                                                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-6">
                                                    {/* Room Image Hook */}
                                                    {room.images?.length > 0 ? (
                                                        <div
                                                            className="relative group/room-img cursor-pointer shrink-0"
                                                            onClick={() => setSelectedImage(room.images[0])}
                                                        >
                                                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-indigo-500/10">
                                                                <img
                                                                    src={room.images[0]}
                                                                    alt={`Room ${room.roomNumber}`}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/room-img:scale-110"
                                                                />
                                                            </div>
                                                            {room.images.length > 1 && (
                                                                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[9px] font-black w-7 h-7 rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
                                                                    +{room.images.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-dashed shrink-0 ${room.available ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-200 bg-slate-100'}`}>
                                                            <ImageIcon className={`w-8 h-8 ${room.available ? 'text-indigo-200' : 'text-slate-300'}`} />
                                                        </div>
                                                    )}

                                                    <div className="space-y-1.5 min-w-0 flex-1">
                                                        <h4 className="font-black text-slate-900 text-xl flex items-center gap-2">
                                                            Room {room.roomNumber}
                                                            <span className="text-slate-200 font-normal">|</span>
                                                            <span className="text-slate-500 text-sm font-bold uppercase tracking-tight">{room.capacity} Person{room.capacity > 1 ? 's' : ''}</span>
                                                        </h4>
                                                        <p className={`font-black uppercase text-[10px] tracking-[0.1em] ${room.available ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {room.available ? 'Available Now' : 'Currently Occupied'}
                                                        </p>
                                                        {room.description && (
                                                            <p className="text-slate-500 text-sm font-medium line-clamp-2 mt-2 leading-relaxed">
                                                                {room.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 lg:mt-0 flex flex-col md:flex-row items-center gap-8 lg:gap-12">
                                                    <div className="text-center md:text-right w-full md:w-auto">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monthly Cost</span>
                                                        <span className="text-3xl font-black text-slate-900 flex items-baseline justify-center md:justify-end gap-1">
                                                            <span className="text-sm font-bold text-slate-400">Rs.</span>
                                                            {room.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {room.available ? (
                                                        <Link to={`/boarding/${boarding._id}/room/${room._id}`} state={{ room, boarding }} className="w-full md:w-auto">
                                                            <Button
                                                                className="w-full rounded-2xl font-black px-10 h-14 transition-all bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95"
                                                            >
                                                                Reserve Now
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            disabled
                                                            className="w-full md:w-auto rounded-2xl font-black px-10 h-14 transition-all bg-slate-200 text-slate-500 scale-95"
                                                        >
                                                            Full / Waitlist
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </motion.div>
                            )}

                            {/* Completely Data-Driven Amenities */}
                            {amenities.length > 0 && (
                                <motion.div variants={fadeInUp} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                            <Layout className="w-8 h-8 text-indigo-500" />
                                            Facilities
                                        </div>
                                        <Badge variant="secondary" className="rounded-xl font-bold px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">{amenities.length} Included</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {amenities.map((amenity, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 drop-shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                    {renderIcon(amenity)}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700 capitalize">{amenity.replace('_', ' ')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Location Details derived from real DB fields */}
                            <motion.div variants={fadeInUp} className="space-y-6 pb-20">
                                <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                    <MapPin className="w-8 h-8 text-indigo-500" />
                                    Neighborhood Explorer
                                </div>
                                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
                                    <h4 className="font-black text-slate-900 text-2xl mb-1">{boarding.city || "Area Information Map"}</h4>
                                    <p className="text-slate-500 font-bold mb-8">{boarding.address}</p>

                                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <p className="text-sm font-medium text-slate-600 md:max-w-[60%]">
                                            For comprehensive directions and to explore the surrounding community, facilities, and transit options.
                                        </p>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer" className="no-underline shrink-0">
                                            <Button className="rounded-xl font-black px-6 bg-slate-900 group-hover:bg-indigo-600 transition-colors w-full">
                                                Open in Google Maps <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Reviews Section */}
                            <motion.div variants={fadeInUp} className="space-y-6 pb-20">
                                <div className="flex items-center gap-3 text-2xl font-black text-slate-900">
                                    <MessageCircle className="w-8 h-8 text-indigo-500" />
                                    Ratings & Reviews
                                    <Badge className="ml-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none rounded-xl font-bold px-3 py-1 text-sm">
                                        {reviews.filter(r => r.comment !== '').length} {reviews.filter(r => r.comment !== '').length === 1 ? 'Review' : 'Reviews'}
                                    </Badge>
                                </div>

                                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                                    {/* Review Submission Form (Only if active tenant) */}
                                    {canReview && (
                                        <div className="mb-10 pb-10 border-b border-dashed border-slate-200">
                                            <h4 className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Share your experience</h4>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Rating</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => setNewRating(prev => prev === star ? 0 : star)}
                                                                className="focus:outline-none transition-transform hover:scale-110"
                                                            >
                                                                <Star className={`w-5 h-5 ${newRating >= star ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-slate-300'}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Review</label>
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        rows={4}
                                                        className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white p-4 font-medium text-slate-700 resize-none transition-all placeholder:text-slate-300 shadow-sm"
                                                        placeholder="Tell others about your stay here..."
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleSubmitReview}
                                                    disabled={isSubmittingReview || (!newRating && !newComment.trim())}
                                                    className="rounded-xl font-black px-8 bg-indigo-600 hover:bg-indigo-700 text-white mt-2 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:scale-100 disabled:opacity-50"
                                                >
                                                    {isSubmittingReview ? "Submitting..." : "Post Review"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {commentsOnlyReviews.length === 0 ? (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                    <MessageCircle className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <p className="text-slate-500 font-bold max-w-xs mx-auto">No reviews yet. {canReview && 'Be the first to share your experience!'}</p>
                                            </div>
                                        ) : (
                                            commentsOnlyReviews.map((review) => (
                                                <div key={review._id} className="p-6 rounded-2xl bg-white border border-slate-100 drop-shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
                                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <Avatar className="w-12 h-12 border-2 border-indigo-50">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.user?.name || "User")}&backgroundColor=4f46e5&textColor=ffffff`} />
                                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black">{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <h5 className="font-black text-slate-900 text-lg leading-tight">{review.user?.name || "Anonymous User"}</h5>
                                                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(review.comment && review.comment.trim() !== '') && (
                                                        <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-50 mt-4">
                                                            "{review.comment}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Booking / Action Sidebar (Right col) */}
                        <div className="lg:col-span-1 h-full">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="sticky top-28 space-y-6"
                            >
                                <Card className="border-none shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-[2.5rem] bg-white overflow-hidden">
                                    <CardContent className="p-8 pb-10 space-y-8">
                                        {/* Price Header based strictly on DB price field */}
                                        <div>
                                            {displayPrice && displayPrice !== Infinity ? (
                                                <div className="flex items-end gap-1.5 mb-4">
                                                    <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Rs. {displayPrice.toLocaleString()}</span>
                                                    <span className="text-slate-400 font-bold mb-1.5 md:mb-2 uppercase text-xs tracking-widest">
                                                        {boarding.type === 'room_based' ? '/room' : '/month'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Price on Request</div>
                                            )}
                                            {boarding.type === 'room_based' && (
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Starting prices from available rooms</p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline" className={`border-emerald-200 bg-emerald-50 text-emerald-700 font-black px-3 py-1 text-[10px] tracking-widest uppercase`}>
                                                    <Activity className="w-3.5 h-3.5 mr-1.5" /> {boarding.status || (boarding.availableRooms > 0 ? 'AVAILABLE' : 'FULLY BOOKED')}
                                                </Badge>
                                                {boarding.totalRooms && (
                                                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 font-black px-3 py-1 text-[10px] tracking-widest uppercase">
                                                        <Home className="w-3.5 h-3.5 mr-1.5" /> {boarding.totalRooms} Units
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <hr className="border-slate-100" />

                                        {/* Real DB Values Mapping */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 transition-all hover:border-indigo-200 hover:bg-white">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Property Listed Date</div>
                                            <div className="flex items-center gap-3 font-bold text-slate-700">
                                                <Calendar className="w-5 h-5 text-indigo-500" />
                                                {new Date(boarding.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>

                                        {boarding.type === 'full_property' && (
                                            <Button
                                                onClick={() => openBooking(null)}
                                                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-all transform active:scale-95 text-lg flex items-center justify-center mt-4"
                                            >
                                                Reserve Property
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => ownerEmail ? window.location.href = `mailto:${ownerEmail}?subject=Interest%20in%20${encodeURIComponent(boarding.boardingName)}` : alert('Contact information currently unavailable.')}
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-[0_8px_20px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 text-lg flex items-center justify-center gap-2 mt-4"
                                        >
                                            <Mail className="w-5 h-5 shadow-sm" /> Contact Landlord
                                        </Button>
                                        <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">No commitment required</p>
                                    </CardContent>
                                </Card>

                                {/* Dynamic Host/Owner Card entirely derived from owner parameter */}
                                {boarding.owner && (
                                    <Card className="border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-[2.5rem] bg-white p-6 mt-6 transition-all hover:border-indigo-100 hover:shadow-indigo-500/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Avatar className="w-14 h-14 border-4 border-slate-50 shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}&backgroundColor=4f46e5&textColor=ffffff`} />
                                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black text-xl">{ownerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-lg text-slate-900 truncate leading-tight">{ownerName}</h4>
                                                <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em] block truncate mt-1">
                                                    {boarding.owner?.role === 'landlord' ? 'Platform Landlord' : 'Property Partner'}
                                                </span>
                                            </div>
                                        </div>
                                        {ownerEmail && (
                                            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 border border-slate-100">
                                                <MessageCircle className="w-4 h-4 text-slate-400" /> {ownerEmail}
                                            </div>
                                        )}
                                    </Card>
                                )}
                            </motion.div>
                        </div>
                    </div>
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
                                    alt="Room Review"
                                    className="max-w-full max-h-full rounded-[2.5rem] shadow-2xl border-4 border-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Booking Modal Instance */}
                    {boarding && (
                        <BookingModal
                            isOpen={isBookingModalOpen}
                            onClose={() => setIsBookingModalOpen(false)}
                            boarding={boarding}
                            room={selectedRoomToBook}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

