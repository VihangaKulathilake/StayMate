import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DynamicSearchInput({
  value = "",
  onChange = () => {},
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  results = [],
  renderItem,
  onSelect,
  emptyMessage = "No matching records found.",
  maxSuggestions = 5,
  showDropdown = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    if (e.target.value.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
  };

  const displayResults = results.slice(0, maxSuggestions);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.trim().length > 0) setIsOpen(true);
          }}
          className={cn(
            "w-full pl-11 pr-10 h-12 bg-white border-slate-200 shadow-sm rounded-2xl text-sm font-semibold transition-all focus-visible:ring-indigo-500/20 focus:shadow-md",
            inputClassName
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dynamic Results Dropdown */}
      {showDropdown && (
        <AnimatePresence>
          {isOpen && value.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden max-h-[380px] overflow-y-auto"
            >
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Live Results ({results.length})
                </span>
                {results.length > maxSuggestions && (
                  <span className="text-[10px] font-bold text-indigo-600">
                    Showing top {maxSuggestions}
                  </span>
                )}
              </div>

              {displayResults.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-400">
                  {emptyMessage}
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {displayResults.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      onClick={() => {
                        if (onSelect) onSelect(item);
                        setIsOpen(false);
                      }}
                      className="p-3 hover:bg-indigo-50/50 transition-colors cursor-pointer"
                    >
                      {renderItem ? (
                        renderItem(item, idx, () => setIsOpen(false))
                      ) : (
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{item.name || item.boardingName || item.title || "Result item"}</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
