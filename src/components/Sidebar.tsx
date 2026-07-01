import React from 'react';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  Users, 
  BarChart3, 
  FolderDot, 
  Activity, 
  Terminal, 
  Compass
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectCount: number;
  taskCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, projectCount, taskCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: projectCount },
    { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare, badge: taskCount },
    { id: 'analytics', label: 'Milestones & Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team Workload', icon: Users },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-[#09090b] border-r border-neutral-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div id="sidebar-header" className="p-6 border-b border-neutral-800/50 flex items-center gap-3">
        <div id="brand-logo-container" className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-md shadow-white/5">
          <Terminal id="brand-logo-icon" className="h-4.5 w-4.5 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <h1 id="brand-name" className="font-sans font-semibold text-sm tracking-tight text-neutral-100">DevSync</h1>
          <p id="brand-subtitle" className="text-[10px] font-mono text-neutral-500 tracking-wider uppercase">Project Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav id="sidebar-nav" className="flex-1 px-4 py-6 space-y-1">
        <p id="nav-section-title" className="px-3 text-[10px] font-mono font-medium text-neutral-500 tracking-wider uppercase mb-3">Workspace</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-neutral-900 text-neutral-100 border border-neutral-800' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40 border border-transparent'
              }`}
            >
              <span id={`nav-link-content-${item.id}`} className="flex items-center gap-2.5">
                <Icon id={`nav-link-icon-${item.id}`} className={`h-4 w-4 transition-transform group-hover:scale-102 ${isActive ? 'text-neutral-100' : 'text-neutral-500 group-hover:text-neutral-400'}`} />
                {item.label}
              </span>
              {item.badge !== undefined && (
                <span id={`nav-link-badge-${item.id}`} className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-850 text-neutral-400 rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Systems Status / Context */}
      <div id="sidebar-footer" className="p-4 border-t border-neutral-800/80 bg-[#09090b]/40">
        <div id="status-panel" className="bg-neutral-900/30 border border-neutral-800/80 rounded-lg p-3">
          <div id="status-heading" className="flex items-center justify-between mb-1.5">
            <span id="status-label" className="text-[10px] font-mono text-neutral-500 uppercase">Local Engine</span>
            <span id="status-indicator-container" className="flex items-center gap-1.5">
              <span id="status-pulse" className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span id="status-text" className="text-[10px] font-mono text-emerald-500 font-medium">ONLINE</span>
            </span>
          </div>
          <div id="status-meta" className="text-[11px] text-neutral-400 font-mono">
            v1.4.2-stable
          </div>
        </div>
      </div>
    </aside>
  );
}
