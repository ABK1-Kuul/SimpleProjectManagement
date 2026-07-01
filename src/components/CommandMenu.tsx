import React, { useState } from 'react';
import { Search, X, Folder, Calendar, Terminal, CheckCircle2 } from 'lucide-react';
import { Project, Task } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
  onSelectTask: (taskId: string) => void;
}

export default function CommandMenu({ 
  isOpen, 
  onClose, 
  projects, 
  tasks, 
  onSelectProject, 
  onSelectTask 
}: CommandMenuProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Search filter
  const cleanQuery = query.trim().toLowerCase();
  
  const filteredProjects = cleanQuery === '' ? [] : projects.filter(
    p => p.name.toLowerCase().includes(cleanQuery) || p.description.toLowerCase().includes(cleanQuery)
  );

  const filteredTasks = cleanQuery === '' ? [] : tasks.filter(
    t => t.title.toLowerCase().includes(cleanQuery) || t.description.toLowerCase().includes(cleanQuery)
  );

  return (
    <div id="command-menu-backdrop" className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-[15vh]">
      <div 
        id="command-menu-container" 
        className="w-full max-w-xl bg-[#09090b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
      >
        {/* Search header input */}
        <div id="command-search-header" className="flex items-center px-4 border-b border-neutral-800 bg-[#09090b]">
          <Search id="command-input-search-icon" className="h-4.5 w-4.5 text-neutral-500 shrink-0" />
          <input
            id="command-input-element"
            type="text"
            placeholder="Type project or task to search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-4 text-xs bg-[#09090b] text-neutral-100 focus:outline-hidden placeholder-neutral-600 font-sans"
            autoFocus
          />
          <button 
            id="command-menu-close-btn"
            onClick={onClose} 
            className="p-1 rounded text-neutral-500 hover:text-neutral-100 transition-colors shrink-0"
          >
            <X id="command-menu-close-icon" className="h-4 w-4" />
          </button>
        </div>

        {/* Results body */}
        <div id="command-results-body" className="max-h-72 overflow-y-auto p-2">
          {cleanQuery === '' ? (
            <div id="command-initial-placeholder" className="p-8 text-center text-neutral-600 space-y-1">
              <Terminal id="command-terminal-icon" className="h-5 w-5 mx-auto text-neutral-700 mb-2" />
              <p id="command-help-text" className="text-xs font-medium">Search Acme Projects</p>
              <p id="command-subhelp-text" className="text-[10px] font-mono">Type a query above to retrieve indexed developer items.</p>
            </div>
          ) : (
            <div id="command-results-list" className="space-y-4 p-2">
              {/* Projects group */}
              {filteredProjects.length > 0 && (
                <div id="command-group-projects" className="space-y-1">
                  <span id="command-group-projects-title" className="px-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Projects</span>
                  {filteredProjects.map(p => (
                    <button
                      id={`command-hit-project-${p.id}`}
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        onClose();
                      }}
                      className="w-full text-left px-2 py-2 rounded hover:bg-neutral-900 flex items-center justify-between text-xs text-neutral-300 hover:text-neutral-100 cursor-pointer transition-colors"
                    >
                      <span id={`command-project-name-${p.id}`} className="flex items-center gap-2 font-medium">
                        <Folder id={`command-project-icon-${p.id}`} className="h-3.5 w-3.5 text-neutral-500" />
                        {p.name}
                      </span>
                      <span id={`command-project-progress-${p.id}`} className="text-[10px] font-mono text-neutral-500">{p.progress}% done</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Tasks group */}
              {filteredTasks.length > 0 && (
                <div id="command-group-tasks" className="space-y-1">
                  <span id="command-group-tasks-title" className="px-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Tasks</span>
                  {filteredTasks.map(t => (
                    <button
                      id={`command-hit-task-${t.id}`}
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t.id);
                        onClose();
                      }}
                      className="w-full text-left px-2 py-2 rounded hover:bg-neutral-900 flex items-center justify-between text-xs text-neutral-300 hover:text-neutral-100 cursor-pointer transition-colors"
                    >
                      <span id={`command-task-title-${t.id}`} className="flex items-center gap-2 font-medium">
                        <CheckCircle2 id={`command-task-icon-${t.id}`} className="h-3.5 w-3.5 text-neutral-500" />
                        {t.title}
                      </span>
                      <span 
                        id={`command-task-status-${t.id}`} 
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          t.status === 'done' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-neutral-900 text-neutral-500'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {filteredProjects.length === 0 && filteredTasks.length === 0 && (
                <div id="command-no-results" className="p-8 text-center text-neutral-600">
                  <p id="no-results-msg" className="text-xs">No project indices found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Command Menu Footer */}
        <div id="command-menu-footer" className="p-3 bg-neutral-900/40 border-t border-neutral-800 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase select-none">
          <span id="footer-kbd-hints" className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </span>
          <span id="footer-esc-hint">esc to close</span>
        </div>
      </div>
    </div>
  );
}
