'use client';

import React from 'react';
import { Search, Bell, Upload, Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  title = "Meetings Workspace"
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h1>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transcripts, topics, participants, action items..."
            className="w-full bg-slate-900/90 text-xs text-slate-200 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 transition placeholder-slate-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-2 transition active:scale-95"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" />
          <span>Upload / New Meeting</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1"></div>

        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-1.5 right-1.5 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-purple-500 absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};
