import React, { useEffect, useState } from 'react';
import { Users, Home, MapPin, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicStats } from "@/api/boardings";

export default function StatsSection() {
    const [realStats, setRealStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getPublicStats();
                setRealStats(data);
            } catch (error) {
                console.error("Failed to fetch public stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        {
            label: "Registered Users",
            value: loading ? "..." : (realStats?.users ?? "10,000+"),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            label: "Boarding Houses",
            value: loading ? "..." : (realStats?.boardings ?? "500+"),
            icon: Home,
            color: "text-rose-600",
            bgColor: "bg-rose-50"
        },
        {
            label: "Cities Covered",
            value: loading ? "..." : (realStats?.cities ?? "25+"),
            icon: MapPin,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            label: "Happy Tenants",
            value: loading ? "..." : (realStats?.bookings ?? "8,500+"),
            icon: Smile,
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow group rounded-2xl overflow-hidden">
                            <CardContent className="p-8 text-center flex flex-col items-center">
                                <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-black text-slate-900 mb-2">{stat.value}</h3>
                                <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

