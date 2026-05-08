import React, { useState } from 'react';
import UserNavbar from '../../components/common/UserNavbar';
import UserSidebar from '../../components/common/UserSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Star, Wifi, Wind, Car, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useSearchParams } from 'react-router-dom';
import { getBoardings } from "@/api/boardings";
import { getMe, updatePreferences } from "@/api/users";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import LocationSearch from '../../components/common/LocationSearch';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [boardingsList, setBoardingsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("recommended");

    // Preferences Modal State
    const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
    const [prefs, setPrefs] = useState({
        preferredLocations: [],
        minPrice: 0,
        maxPrice: 50000,
        requiredFacilities: [],
        preferredType: "Any",
        noOfRooms: 0
    });
    const [isSavingPrefs, setIsSavingPrefs] = useState(false);

    React.useEffect(() => {
        fetchUserPrefs();

        // Clean all filters when exiting the marketplace
        // The return () => { ... } part is like saying: "And hey,
        // before you clock out and leave this page,
        // I need you to do exactly this one last chore."
        // This is called a cleanup function.
        // The cleanup function runs when the component unmounts
        // or before the effect runs again (if dependencies change).
        // Here, it runs when the user leaves the Marketplace page.
        return () => {
            updatePreferences({
                preferredLocations: [],
                minPrice: 0,
                maxPrice: 50000,
                requiredFacilities: [],
                preferredType: "any",
                noOfRooms: 0
            }).catch(e => console.error("Failed to clear filters on exit:", e));
        };
    }, []);

    React.useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchBoardings();

            const params = new URLSearchParams(searchParams);
            if (searchQuery) params.set("q", searchQuery);
            else params.delete("q");
            setSearchParams(params, { replace: true });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory, sortBy]);

    const fetchBoardings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.q = searchQuery;

            if (sortBy) params.sortBy = sortBy;

            let data = await getBoardings(params);

            if (selectedCategory !== "All") {
                const catLower = selectedCategory.toLowerCase();
                data = data.filter(b =>
                    b.boardingName?.toLowerCase().includes(catLower) ||
                    b.description?.toLowerCase().includes(catLower) ||
                    b.type?.toLowerCase().includes(catLower)
                );
            }
            setBoardingsList(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPrefs = async () => {
        try {
            const user = await getMe();
            if (user && user.preferences) {
                setPrefs({
                    preferredLocations: user.preferences.preferredLocations || [],
                    minPrice: user.preferences.minPrice || 0,
                    maxPrice: user.preferences.maxPrice || 50000,
                    requiredFacilities: user.preferences.requiredFacilities || [],
                    preferredType: user.preferences.preferredType || "any"
                });
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error);
        }
    };

    const handleSavePrefs = async () => {
        try {
            setIsSavingPrefs(true);
            await updatePreferences(prefs);
            setIsPrefsModalOpen(false);
            fetchBoardings(); // Refresh results with new recommendations
        } catch (error) {
            console.error("Error saving preferences:", error);
        } finally {
            setIsSavingPrefs(false);
        }
    };

    const commonFacilities = ["Wifi", "Parking", "Kitchen", "AC", "Laundry", "Gym"];

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <UserNavbar />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <main className="flex-1 container mx-auto px-4 py-8 overflow-y-auto">
                    {/* Search & Filter Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
                    >
                        <div className="w-full md:w-1/2 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Where do you want to stay?"
                                className="w-full pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg focus-visible:ring-primary/20 transition-all focus:shadow-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[160px] h-12 bg-white border-none shadow-sm rounded-xl focus:ring-primary/20">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recommended">Recommended</SelectItem>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                                    <SelectItem value="rating">Top Rated</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Preferences Modal */}
                            <Dialog open={isPrefsModalOpen} onOpenChange={setIsPrefsModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 border-none shadow-indigo-100 shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold px-6 active:scale-95 transition-all">
                                        <Sparkles className="w-4 h-4" /> Personalize
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md bg-white rounded-3xl border-none shadow-2xl p-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black text-slate-950">Personalize Your Feed</DialogTitle>
                                        <DialogDescription className="text-slate-500 font-medium">
                                            Tell us what you're looking for to get better recommendations.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-8 py-6">
                                        {/* Type */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Preferred Type</Label>
                                            <Select value={prefs.preferredType} onValueChange={(value) => setPrefs({ ...prefs, preferredType: value })}>
                                                <SelectTrigger className="w-full h-12 bg-white border-none shadow-sm rounded-xl focus:ring-primary/20">
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="any">Any</SelectItem>
                                                    <SelectItem value="full_property">House</SelectItem>
                                                    <SelectItem value="room_based">Room</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Number of Rooms */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Number of Rooms</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="e.g., 2"
                                                value={prefs.noOfRooms || ""}
                                                onChange={(e) => setPrefs({ ...prefs, noOfRooms: e.target.value })}
                                                className="h-12 bg-white border-none shadow-sm rounded-xl focus:ring-primary/20"
                                            />
                                        </div>


                                        {/* Preferred Locations with Nominatim Autocomplete */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Preferred Locations</Label>

                                            {/* Search Input */}
                                            <LocationSearch
                                                onLocationSelect={(location) => {
                                                    // Add location if not already selected
                                                    if (!prefs.preferredLocations.find(l => l.name === location.name)) {
                                                        setPrefs({
                                                            ...prefs,
                                                            preferredLocations: [...prefs.preferredLocations, location]
                                                        });
                                                    }
                                                }}
                                            />

                                            {/* Display Selected Locations as Tags */}
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {prefs.preferredLocations.map((location, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                                    >
                                                        <MapPin className="w-3 h-3" />
                                                        {location.name}
                                                        <span className="text-xs text-indigo-500">({location.locationType})</span>
                                                        <button
                                                            onClick={() => {
                                                                setPrefs({
                                                                    ...prefs,
                                                                    preferredLocations: prefs.preferredLocations.filter((_, i) => i !== idx)
                                                                });
                                                            }}
                                                            className="text-indigo-500 hover:text-indigo-700 font-bold"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>


                                    {/* Price Range */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Budget Range (Rs.)</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-tighter">Min</span>
                                                <Input
                                                    type="number"
                                                    value={prefs.minPrice}
                                                    onChange={(e) => setPrefs({ ...prefs, minPrice: Number(e.target.value) })}
                                                    className="bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-indigo-500/20"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-tighter">Max</span>
                                                <Input
                                                    type="number"
                                                    value={prefs.maxPrice}
                                                    onChange={(e) => setPrefs({ ...prefs, maxPrice: Number(e.target.value) })}
                                                    className="bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-indigo-500/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    <div className="space-y-4">
                                        <Label className="text-sm font-black uppercase tracking-widest text-slate-400">Essential Facilities</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {commonFacilities.map(facility => (
                                                <div key={facility} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => {
                                                    const current = prefs.requiredFacilities;
                                                    const updated = current.includes(facility)
                                                        ? current.filter(f => f !== facility)
                                                        : [...current, facility];
                                                    setPrefs({ ...prefs, requiredFacilities: updated });
                                                }}>
                                                    <Checkbox
                                                        id={facility}
                                                        checked={prefs.requiredFacilities.includes(facility)}
                                                        className="data-[state=checked]:bg-indigo-600 border-slate-300"
                                                    />
                                                    <Label htmlFor={facility} className="text-xs font-bold text-slate-600 cursor-pointer">{facility}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            onClick={handleSavePrefs}
                                            disabled={isSavingPrefs}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-200"
                                        >
                                            {isSavingPrefs ? "Syncing..." : "Update Recommendations"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </motion.div>

                    {/* Categories */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar"
                    >
                        {([
                            { label: "All", value: "All" },
                            { label: "House", value: "full_property" },
                            { label: "Room", value: "room_based" }
                        ]).map((cat) => (
                            <Button
                                key={cat.value}
                                variant={selectedCategory === cat.value ? "default" : "outline"}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`rounded-full px-6 whitespace-nowrap border-none shadow-sm transition-all active:scale-95 ${selectedCategory === cat.value ? "shadow-primary/20 bg-primary text-white" : "bg-white hover:bg-slate-100 text-slate-600"}`}
                            >
                                {cat.label}
                            </Button>
                        ))}
                    </motion.div>

                    {/* Results Count */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Found {boardingsList.length} Boardings</h2>
                        <p className="text-slate-500 font-medium">Showing curated matches based on your preferences</p>
                    </motion.div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.p
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="col-span-full text-center p-12 text-slate-400 font-bold italic tracking-widest"
                                >
                                    Scanning Boarding Infrastructure...
                                </motion.p>
                            ) : (
                                boardingsList.map((boarding) => (
                                    <motion.div
                                        key={boarding._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -12 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="h-full"
                                    >
                                        <Link to={`/boarding/${boarding._id}`} className="block group h-full focus:outline-none">
                                            <Card className="relative h-full flex flex-col bg-white rounded-[2rem] border-none overflow-hidden transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">

                                                {/* Image Container */}
                                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                                    <motion.img
                                                        src={boarding.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60"}
                                                        alt={boarding.boardingName}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover"
                                                        initial={{ scale: 1 }}
                                                        whileHover={{ scale: 1.08 }}
                                                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                                    />

                                                    {/* Badges Overlay */}
                                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                                                        <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none backdrop-blur-md shadow-sm px-4 py-1.5 font-bold rounded-full uppercase text-[10px] tracking-widest">
                                                            {boarding.type?.replace('_', ' ') || "Boarding"}
                                                        </Badge>
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                // Handle wishlist logic
                                                            }}
                                                            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm transition-all"
                                                        >
                                                            <Heart className="w-5 h-5 transition-colors" />
                                                        </motion.button>
                                                    </div>

                                                    {/* Quick Info Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20 flex items-center gap-4 text-white">
                                                        {(boarding.amenities || boarding.facilities)?.slice(0, 2).map(amenity => (
                                                            <div key={amenity} className="flex items-center gap-1.5">
                                                                <span className="text-xs font-medium uppercase tracking-tight">{amenity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <CardHeader className="p-5 pb-0">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="space-y-1.5 flex-1 min-w-0">
                                                            <CardTitle className="text-xl font-black text-slate-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                                {boarding.boardingName}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <MapPin className="w-4 h-4 shrink-0 text-primary/80" />
                                                                <p className="text-sm font-medium truncate">
                                                                    {boarding.address || "Location Pending"}
                                                                </p>
                                                            </div>
                                                            {boarding.distance && (
                                                                <div className="flex items-center gap-1.5 text-indigo-600 pt-1">
                                                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                                    <p className="text-xs font-bold uppercase tracking-tight">
                                                                        {boarding.distance} km away
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end shrink-0 gap-1 mt-1">
                                                            <div className="flex items-center gap-1 bg-amber-100/80 text-amber-700 px-2.5 py-1 rounded-lg">
                                                                <Star className="w-3.5 h-3.5 flex-shrink-0 fill-amber-500 text-amber-500" />
                                                                <span className="text-sm font-black">{boarding.rating || "New"}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="p-5 pt-4 flex-grow flex flex-col justify-end">
                                                    <div className="flex gap-2 flex-wrap pt-4 border-t border-slate-100">
                                                        {boarding.facilities?.slice(0, 4).map((facility) => (
                                                            <Badge key={facility} variant="secondary" className="bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-tighter rounded-md px-2 py-0.5 border-none">
                                                                {facility}
                                                            </Badge>
                                                        ))}
                                                        {(!boarding.facilities || boarding.facilities.length === 0) && (
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Standard Amenities</p>
                                                        )}
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] block mb-0.5">
                                                            {boarding.type === "room_based" ? "Starting from" : "Monthly Rent"}
                                                        </span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-black text-slate-900 leading-none">
                                                                Rs. {boarding.price?.toLocaleString() || "P.O.A"}
                                                            </span>
                                                            {boarding.type === "room_based" && <span className="text-[10px] text-indigo-500 font-black uppercase tracking-tighter">/MONTH</span>}
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-900 group-hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2">
                                                        Explore
                                                        <span className="transition-transform group-hover:translate-x-1">→</span>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

