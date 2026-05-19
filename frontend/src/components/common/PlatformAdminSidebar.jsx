import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Building2, Users, ChevronRight, Headset } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { name: "Landlords", href: "/admin/landlords", icon: Building2 },
  { name: "Tenants", href: "/admin/tenants", icon: Users },
  { name: "Boardings", href: "/admin/boardings", icon: Building2 },
  { name: "Support Hub", href: "/contact", icon: Headset },
];

export default function PlatformAdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-100 hidden lg:flex flex-col">
      <div className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
        <div className="px-4 mb-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Platform Controls</span>
        </div>
        <div className="p-4 space-y-2">
          {links.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 no-underline transition-colors",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="inline-flex items-center gap-3 font-bold">
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </span>
                <ChevronRight className={cn("w-4 h-4", active ? "opacity-100" : "opacity-30")} />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
