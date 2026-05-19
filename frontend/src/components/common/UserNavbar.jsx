import React from 'react';
import {
    Home,
    DoorOpen,
    CreditCard,
    Headset,
    Search,
    UserCircle,
    History,
    LogOut,
    Menu,
    MessageSquare
} from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { clearAuthSession, getCurrentUser } from "@/lib/auth";
import Logo from "@/components/common/Logo";

export default function UserNavbar() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const getInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        clearAuthSession();
        navigate("/login", { replace: true });
    };

    const navLinks = [
        { name: "Home", href: "/client-home", icon: Home },
        { name: "Find Boarding", href: "/marketplace", icon: Search },
        { name: "My Stays", href: "/my-bookings", icon: DoorOpen },
        { name: "Payments", href: "/payments", icon: CreditCard },
        { name: "Support Hub", href: "/contact", icon: MessageSquare },
    ];

    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-8">
                    <Link to="/client-home" className="transition-opacity hover:opacity-80 no-underline">
                        <Logo suffix="Tenant" />
                    </Link>
                </div>


                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const q = new FormData(e.target).get('q');
                        if (q) navigate(`/marketplace?q=${encodeURIComponent(q)}`);
                    }} className="hidden md:flex relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search boardings..."
                            className="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-full"
                        />
                    </form>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:bg-slate-100">
                                <Avatar className="h-9 w-9 border border-slate-200">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {getInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link to="/profile" className="no-underline text-slate-900">
                                <DropdownMenuItem className="cursor-pointer">
                                    <UserCircle className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>My Profile</span>
                                </DropdownMenuItem>
                            </Link>
                            <Link to="/payments" className="no-underline text-slate-900">
                                <DropdownMenuItem className="cursor-pointer">
                                    <History className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Payment History</span>
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-700 hover:bg-slate-100">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left">
                                        <Logo size="sm" />
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-2 mt-8">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.href}
                                            className="flex items-center gap-3 px-4 py-3 text-lg font-medium text-slate-600 hover:bg-slate-50 hover:text-primary rounded-lg transition-all no-underline"
                                        >
                                            <link.icon className="w-5 h-5" />
                                            {link.name}
                                        </Link>
                                    ))}
                                    <hr className="my-4" />
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Account</p>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="ghost" className="justify-start gap-3 h-12 text-lg font-medium">
                                                <UserCircle className="w-5 h-5" /> Profile
                                            </Button>
                                            <Button variant="ghost" className="justify-start gap-3 h-12 text-lg font-medium">
                                                <History className="w-5 h-5" /> History
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="justify-start gap-3 h-12 text-lg font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-5 h-5" /> Logout
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
