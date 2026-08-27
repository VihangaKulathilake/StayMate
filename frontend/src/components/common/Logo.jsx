import React from 'react';
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Universal Logo component for StayMate
 * @param {string} className - Additional classes for the container
 * @param {string} iconClassName - Classes for the icon container
 * @param {string} textClassName - Classes for the label text
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} size - Predefined size scales
 * @param {'default' | 'white' | 'dark' | 'brand'} variant - Color theme variants
 * @param {string} suffix - Optional text to append (e.g., "Admin", "Console")
 * @param {boolean} hideIcon - Whether to hide the icon
 * @param {boolean} hideText - Whether to hide the text label
 */
const Logo = ({ 
  className, 
  iconClassName, 
  textClassName, 
  size = "md", 
  variant = "default", 
  suffix,
  hideIcon = false,
  hideText = false
}) => {
  const sizeMap = {
    xs: { icon: "w-4 h-4", text: "text-base" },
    sm: { icon: "w-5 h-5", text: "text-lg" },
    md: { icon: "w-6 h-6", text: "text-xl" },
    lg: { icon: "w-8 h-8", text: "text-2xl" },
    xl: { icon: "w-10 h-10", text: "text-3xl" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const variantMap = {
    default: { icon: "text-primary", text: "text-slate-900" },
    white: { icon: "text-white", text: "text-white" },
    dark: { icon: "text-blue-500", text: "text-slate-100" },
    brand: { icon: "text-white bg-primary p-1.5 rounded-lg", text: "text-slate-900" }
  };

  const currentVariant = variantMap[variant] || variantMap.default;

  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {!hideIcon && (
        <div className={cn(currentVariant.icon, "shrink-0 flex items-center justify-center", iconClassName)}>
          <Home className={currentSize.icon} />
        </div>
      )}
      {!hideText && (
        <span className={cn("font-display font-black tracking-tight whitespace-nowrap flex items-baseline", currentSize.text, currentVariant.text, textClassName)}>
          Stay<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Mate</span>
          {suffix && (
            <span className="font-sans font-black text-indigo-600 ml-2 text-[0.5em] px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 uppercase tracking-widest self-center">
              {suffix}
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default Logo;
