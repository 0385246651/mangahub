"use client";

import { useEffect, useState } from "react";

interface StatsDisplayProps {
  totalItems: number;
  itemsUpdateInDay: number;
}

export function StatsDisplay({ totalItems, itemsUpdateInDay }: StatsDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`flex gap-2 sm:gap-4 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
      {/* Total Comics */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 cursor-default hover:border-primary/40 transition-all">
        <div className="size-8 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Tổng truyện</p>
          <p className="text-base sm:text-lg font-bold text-foreground">{totalItems.toLocaleString()}</p>
        </div>
      </div>

      {/* Daily Updates */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 cursor-default hover:border-blue-500/40 transition-all">
        <div className="size-8 sm:size-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Hôm nay</p>
          <p className="text-base sm:text-lg font-bold text-blue-500">{itemsUpdateInDay}</p>
        </div>
      </div>
    </div>
  );
}
