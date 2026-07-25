import React, { useEffect, useState } from 'react';
import { getBoardings } from "@/api/boardings";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default function FeaturedBoardingsSection() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [savedProperties, setSavedProperties] = useState({});
    const isAuthenticated = !!getCurrentUser();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const data = await getBoardings({ limit: 6 });
                setFeatured(data);
            } catch (error) {
                console.error("Failed to load featured boardings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const toggleSave = (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        setSavedProperties(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const getLinkPath = (id) => {
        return isAuthenticated ? `/boarding/${id}` : `/login`;
    };

    const filteredBoardings = featured.filter(b => {
        if (activeTab === 'room') return b.type === 'room_based';
        if (activeTab === 'full') return b.type === 'full_property';
        return true;
    }).slice(0, 3);

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100" id="featured-properties">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 space-y-4">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm inline-flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary" /> Handpicked Selection
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Featured Accommodations</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Explore some of our highest-rated and most convenient student/professional boardings.
                    </p>

                    {/* Interactive Category Filter Pills */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {[
                            { id: 'all', label: 'All Stays' },
                            { id: 'room', label: 'Room Based' },
                            { id: 'full', label: 'Full Annex / House' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105'
                                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-96 rounded-[2rem] bg-slate-200/60 animate-pulse" />
                        ))}
                    </div>
                ) : filteredBoardings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200 max-w-lg mx-auto p-8">
                        <p className="text-slate-500 font-bold">No accommodations found in this category yet.</p>
                        <Button onClick={() => setActiveTab('all')} variant="outline" className="mt-4 rounded-xl font-bold">
                            View All Stays
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredBoardings.map((boarding) => {
                                const priceDisplay = boarding.price ? `Rs. ${boarding.price.toLocaleString()}` : "Contact Landlord";
                                const image = boarding.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60";
                                const isSaved = !!savedProperties[boarding._id];

                                return (
                                    <motion.div
                                        key={boarding._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full"
                                    >
                                        <Card className="relative h-full flex flex-col bg-white rounded-[2rem] border-none overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] group">
                                            {/* Image & Quick Action */}
                                            <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                <img
                                                    src={image}
                                                    alt={boarding.boardingName}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                                                />
                                                <div className="absolute top-4 left-4 z-20">
                                                    <Badge className="bg-white/95 text-slate-900 hover:bg-white border-none backdrop-blur-md shadow-sm px-4 py-1.5 font-bold rounded-full uppercase text-[10px] tracking-widest">
                                                        {boarding.type?.replace('_', ' ') || "Boarding"}
                                                    </Badge>
                                                </div>

                                                <button
                                                    onClick={(e) => toggleSave(boarding._id, e)}
                                                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-rose-500 hover:bg-white transition-all shadow-md active:scale-90"
                                                    title={isSaved ? "Saved" : "Save Stay"}
                                                >
                                                    <Heart className={`w-5 h-5 transition-colors ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <CardHeader className="p-6 pb-2">
                                                <div className="space-y-2">
                                                    <CardTitle className="text-2xl font-black text-slate-900 leading-tight truncate">
                                                        {boarding.boardingName}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <MapPin className="w-4 h-4 shrink-0 text-primary" />
                                                        <p className="text-sm font-semibold truncate">{boarding.address}, {boarding.city}</p>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-6 pt-2 flex-grow flex flex-col justify-between space-y-4">
                                                <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                                    {boarding.description}
                                                </p>
                                                <div className="flex gap-2 flex-wrap pt-4 border-t border-slate-100">
                                                    {boarding.facilities?.slice(0, 3).map((facility) => (
                                                        <Badge key={facility} variant="secondary" className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md px-2.5 py-1 border-none">
                                                            {facility.replace('_', ' ')}
                                                        </Badge>
                                                    ))}
                                                    {(!boarding.facilities || boarding.facilities.length === 0) && (
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Standard Amenities</p>
                                                    )}
                                                </div>
                                            </CardContent>

                                            <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-slate-50">
                                                <div className="flex flex-col pt-4">
                                                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] block mb-0.5">
                                                        {boarding.type === "room_based" ? "Starting from" : "Monthly Rent"}
                                                    </span>
                                                    <span className="text-2xl font-black text-slate-900 leading-none">
                                                        {priceDisplay}
                                                    </span>
                                                </div>

                                                <Link to={getLinkPath(boarding._id)}>
                                                    <Button className="bg-slate-900 hover:bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center gap-2 group/btn h-11 px-5">
                                                        View Space
                                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                <div className="text-center mt-16">
                    <Link to={isAuthenticated ? "/marketplace" : "/login"}>
                        <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold shadow-xl shadow-primary/10 hover:scale-105 transition-transform group">
                            Browse All Stays
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
