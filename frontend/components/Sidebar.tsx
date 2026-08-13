'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Flame, 
  Video, 
  Search, 
  BarChart2, 
  Grid, 
  Settings, 
  PlusCircle, 
  ChevronDown, 
  Users,
  Sparkles,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenFredModal: () => void;
  onOpenIntegrationsModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenFredModal,
  onOpenIntegrationsModal,
  onOpenSettingsModal
}) => {
  const router = useRouter();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const handleNavClick = (id: string, customOnClick?: () => void) => {
    if (customOnClick) {
      customOnClick();
    } else {
      onSelectTab(id);
      if (id === 'meetings') {
        router.push('/');
      }
    }
  };

  const navItems = [
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'search', label: 'Smart Search', icon: Search, badge: 'AI' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'integrations', label: 'Integrations', icon: Grid, onClick: onOpenIntegrationsModal },
    { id: 'settings', label: 'Settings', icon: Settings, onClick: onOpenSettingsModal }
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Logo & Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                fireflies<span className="text-purple-400 font-extrabold">.ai</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono block -mt-1">Workspace v2.4</span>
            </div>
          </Link>
        </div>

        {/* Workspace Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/50 relative">
          <button 
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-sm text-slate-200 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center justify-center">
                E
              </div>
              <span className="truncate font-medium text-xs">Engineering Workspace</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
          </button>

          {workspaceOpen && (
            <div className="absolute top-14 left-4 right-4 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 z-40 text-xs">
              <div className="px-2 py-1.5 text-slate-400 font-medium">Workspaces</div>
              <div className="p-2 rounded bg-purple-950/40 text-purple-300 font-medium flex items-center gap-2 cursor-pointer">
                <Zap className="w-3.5 h-3.5" /> Engineering Workspace
              </div>
              <div className="p-2 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-2 cursor-pointer mt-1">
                <Users className="w-3.5 h-3.5" /> Product & Sales Hub
              </div>
            </div>
          )}
        </div>

        {/* Add Fred CTA */}
        <div className="p-4">
          <button
            onClick={onOpenFredModal}
            className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition active:scale-[0.98] border border-purple-400/20"
          >
            <PlusCircle className="w-4 h-4 text-purple-200" />
            <span>Add Fred to Live Call</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.onClick)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive 
                    ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logged in User Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                alt="Alex Rivera"
                className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">Alex Rivera</div>
              <div className="text-[10px] text-slate-400">alex@fireflies.ai</div>
            </div>
          </div>
          <button onClick={onOpenSettingsModal} className="text-slate-400 hover:text-slate-200">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
