import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Users,
    Banknote,
    ChevronRight,
    Headset,
    Wallet
} from "lucide-react";
import { NavLink, Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Boardings", href: "/boardings", icon: Building2 },
        { name: "Tenants", href: "/tenants", icon: Users },
        { name: "Payments", href: "/payments", icon: Wallet },
        { name: "Messages", href: "/contact", icon: Headset },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col">
            <div className="h-16 flex items-center px-8 border-b border-slate-50">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Navigation</span>
            </div>
            <div className="flex-grow py-6 px-4 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => cn(
                            "flex items-center justify-between px-4 py-3 rounded-2xl transition-all no-underline group",
                            isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-bold">{item.name}</span>
                        </div>
                        <ChevronRight className={cn(
                            "w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-50 group-hover:translate-x-0"
                        )} />
                    </NavLink>
                ))}
            </div>
            <div className="p-4 border-t border-slate-50">
                <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Help Center</p>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">Need help with managing properties?</p>
                    <Link to="/contact" className="text-xs font-bold text-primary hover:underline no-underline">Contact Support</Link>
                </div>
            </div>
        </aside>
    );
}
