import React, { useState, useRef } from 'react';
import {
  Search,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserProfilePanel from './UserProfilePanel';

interface HeaderProps {
  title: string;
  subtitle: string;
  onOpenSearch: () => void;
  onSimulateCommit: () => void;
}

function getAvatarGradient(avatar: string) {
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  ];
  const idx = (avatar.charCodeAt(0) + (avatar.charCodeAt(1) || 0)) % gradients.length;
  return gradients[idx];
}

export default function Header({ title, subtitle, onOpenSearch, onSimulateCommit }: HeaderProps) {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const avatarBtnRef = useRef<HTMLButtonElement>(null);

  const formatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const avatarGradient = user ? getAvatarGradient(user.avatar) : 'linear-gradient(135deg, #3f3f46 0%, #27272a 100%)';

  return (
    <>
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

          {/* Separator */}
          <span className="h-4 w-px bg-neutral-800" />

          {/* User avatar button */}
          <button
            ref={avatarBtnRef}
            id="header-user-avatar-btn"
            onClick={() => setIsProfileOpen(v => !v)}
            title={user ? `${user.displayName} — click to view profile` : 'User'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: '1px solid transparent',
              borderRadius: '8px',
              padding: '3px 6px 3px 3px',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
            }}
          >
            <div
              id="header-user-avatar"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                flexShrink: 0,
              }}
            >
              {user?.avatar ?? 'ME'}
            </div>
            {user && (
              <span style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#a1a1aa',
                whiteSpace: 'nowrap',
              }}>
                {user.displayName}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* User Profile Panel (portal-like dropdown) */}
      <UserProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRef={avatarBtnRef}
      />
    </>
  );
}
