import React, { useEffect, useState } from 'react';
import { getBoardings } from "@/api/boardings";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default function FeaturedBoardingsSection() {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!getCurrentUser();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch approved boardings
                const data = await getBoardings({ limit: 3 });
                // Take the first 3
                setFeatured(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to load featured boardings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const getLinkPath = (id) => {
        return isAuthenticated ? `/boarding/${id}` : `/login`;
    };

    if (loading) {
        return (
            <section className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-400 font-bold italic tracking-widest animate-pulse">Curating Featured Properties...</p>
                </div>
            </section>
        );
    }

    if (featured.length === 0) {
        return null; // Don't show the section if no properties are in the database yet
    }

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-100" id="featured-properties">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">Handpicked Selection</span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Featured Accommodations</h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Explore some of our highest-rated and most convenient student/professional boardings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featured.map((boarding) => {
                        const priceDisplay = boarding.price ? `Rs. ${boarding.price.toLocaleString()}` : "Contact Landlord";
                        const image = boarding.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60";
                        return (
                            <motion.div
                                key={boarding._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -8 }}
                                transition={{ duration: 0.4 }}
                                className="h-full"
                            >
                                <Card className="relative h-full flex flex-col bg-white rounded-[2rem] border-none overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] group">
                                    {/* Image */}
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
                </div>

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
