import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Users, Building2, BarChart3, LogOut, Menu, Search, UserCircle, MessageSquare, Headset } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearAuthSession, getCurrentUser } from "@/lib/auth";
import Logo from "@/components/common/Logo";

const links = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Landlords", href: "/admin/landlords", icon: Building2 },
  { name: "Tenants", href: "/admin/tenants", icon: Users },
  { name: "Boardings", href: "/admin/boardings", icon: Building2 },
  { name: "Support Hub", href: "/contact", icon: Headset },
];

export default function PlatformAdminNavbar() {
  const navigate = useNavigate();
  const authUser = getCurrentUser();
  const initials = (authUser?.name || 'SA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/admin/dashboard" className="no-underline hover:opacity-90">
            <Logo suffix="Admin" iconClassName="text-emerald-500" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search users, properties..."
              className="pl-9 h-9 rounded-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary/20"
            />
          </div>

          <Link to="/contact">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-9 w-9 p-0 hover:bg-slate-100">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>System Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link to="/profile" className="no-underline text-inherit flex items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    StayMate Console
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {links.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-700 hover:bg-slate-100 no-underline font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
