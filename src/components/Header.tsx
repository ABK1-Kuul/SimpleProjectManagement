import React from 'react';
import { 
  Search, 
  Sparkles, 
  Github, 
  Clock, 
  HelpCircle,
  Bell
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenSearch: () => void;
  onSimulateCommit: () => void;
}

export default function Header({ title, subtitle, onOpenSearch, onSimulateCommit }: HeaderProps) {
  // Get current date time for Vercel style toolbar
  const formatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <header id="main-header" className="h-14 bg-[#09090b] border-b border-neutral-800 flex items-center justify-between px-6 shrink-0 select-none">
      {/* Title & Path */}
      <div id="header-breadcrumbs" className="flex items-center gap-2">
        <span id="breadcrumb-org" className="text-xs font-mono font-medium text-neutral-500 hover:text-neutral-400 cursor-pointer transition-colors">ACME WORKSPACE</span>
        <span id="breadcrumb-divider" className="text-neutral-700 text-xs font-mono">/</span>
        <span id="breadcrumb-view" className="text-xs font-sans font-semibold text-neutral-200 tracking-tight">{title}</span>
      </div>

      {/* Center Command Bar Trigger */}
      <div id="header-center-controls" className="hidden md:flex items-center gap-2">
        <button 
          id="command-menu-trigger"
          onClick={onOpenSearch}
          className="flex items-center justify-between w-64 px-3 py-1.5 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-md text-[11px] font-sans text-neutral-500 hover:text-neutral-400 transition-all duration-150 cursor-pointer"
        >
          <span id="command-trigger-left" className="flex items-center gap-2">
            <Search id="command-search-icon" className="h-3.5 w-3.5" />
            Quick find task or project...
          </span>
          <kbd id="command-trigger-kbd" className="bg-[#09090b] px-1.5 py-0.5 rounded border border-neutral-800 text-[9px] font-mono font-semibold text-neutral-400">⌘K</kbd>
        </button>
      </div>

      {/* Right Side Quick Actions */}
      <div id="header-right-controls" className="flex items-center gap-3">
        {/* Sim Commit button */}
        <button
          id="simulate-activity-btn"
          onClick={onSimulateCommit}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-md text-[10px] font-mono font-medium text-neutral-300 hover:text-neutral-100 transition-all duration-150 shadow-xs"
          title="Inject a mock developers commit event to populate activity timeline"
        >
          <Sparkles id="simulate-activity-icon" className="h-3 w-3 text-emerald-400" />
          SIMULATE ACTIVITY
        </button>

        {/* Separator */}
        <span id="header-controls-separator" className="h-4 w-px bg-neutral-850" />

        {/* Clock */}
        <div id="header-clock" className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
          <Clock id="header-clock-icon" className="h-3 w-3" />
          {formatTime()} UTC
        </div>

        {/* User profile */}
        <div id="header-user-badge" className="flex items-center gap-2 pl-1">
          <div id="header-user-avatar" className="h-6 w-6 rounded-full bg-linear-to-b from-neutral-700 to-neutral-900 border border-neutral-800 flex items-center justify-center">
            <span id="header-user-initials" className="text-[10px] font-semibold text-neutral-100">ME</span>
          </div>
        </div>
      </div>
    </header>
  );
}
