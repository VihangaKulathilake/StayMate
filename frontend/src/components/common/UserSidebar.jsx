import React from 'react';
import { Home, Compass, User, CreditCard, LogOut, MessageSquare, ChevronRight, DoorOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from "@/lib/utils";

export default function UserSidebar() {
    const menuItems = [
        { name: "Dashboard", href: "/client-home", icon: Home },
        { name: "Marketplace", href: "/marketplace", icon: Compass },
        { name: "My Stays", href: "/my-bookings", icon: DoorOpen },
        { name: "Payments", href: "/payments", icon: CreditCard },
        { name: "Support Hub", href: "/contact", icon: MessageSquare },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col">
            <div className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
                <div className="px-4 mb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tenant Portal</span>
                </div>
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
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-bold whitespace-nowrap">{item.name}</span>
                        </div>
                        <ChevronRight className={cn(
                            "w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-50 group-hover:translate-x-0"
                        )} />
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-slate-50">
                <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">StayMate Support</p>
                    <p className="text-xs text-slate-500 mt-1">Need help with your stay? Submit a ticket.</p>
                    <NavLink to="/contact" className="text-xs font-bold text-blue-600 hover:underline no-underline">Open Support Ticket</NavLink>
                </div>
            </div>
        </aside>
    );
}
