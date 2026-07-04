import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Folder, CheckCircle2, Tag, Clock, ArrowRight } from 'lucide-react';
import { Project, Task } from '../types';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
  onSelectTask: (taskId: string) => void;
}

type ResultItem =
  | { kind: 'project'; item: Project }
  | { kind: 'task';    item: Task };

const STATUS_LABEL: Record<string, string> = {
  todo:       'To Do',
  inprogress: 'In Progress',
  inreview:   'In Review',
  done:       'Done',
};

export default function CommandMenu({
  isOpen, onClose, projects, tasks, onSelectProject, onSelectTask,
}: CommandMenuProps) {
  const [query,       setQuery]       = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  // ── Build result list ──────────────────────────────────────────────────────
  const results: ResultItem[] = q === ''
    // Recent items when empty: last 3 projects + last 5 non-done tasks
    ? [
        ...projects.slice(0, 3).map(p => ({ kind: 'project' as const, item: p })),
        ...tasks.filter(t => t.status !== 'done').slice(0, 5).map(t => ({ kind: 'task' as const, item: t })),
      ]
    : [
        ...projects
          .filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
          )
          .map(p => ({ kind: 'project' as const, item: p })),
        ...tasks
          .filter(t =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some(tag => tag.toLowerCase().includes(q))
          )
          .map(t => ({ kind: 'task' as const, item: t })),
      ];

  // Clamp activeIndex when results change
  useEffect(() => {
    setActiveIndex(i => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const select = useCallback((r: ResultItem) => {
    if (r.kind === 'project') onSelectProject(r.item.id);
    else                       onSelectTask(r.item.id);
    onClose();
  }, [onSelectProject, onSelectTask, onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); select(results[activeIndex]); }
  };

  if (!isOpen) return null;

  const projectResults = results.filter(r => r.kind === 'project');
  const taskResults    = results.filter(r => r.kind === 'task');
  let cursor = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-[15vh]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl bg-[#09090b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col">

        {/* Search input */}
        <div className="flex items-center px-4 border-b border-neutral-800">
          <Search className="h-4 w-4 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            type="text"
            placeholder={q === '' ? 'Search projects, tasks, tags…' : undefined}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onKeyDown}
            className="w-full px-3 py-4 text-xs bg-transparent text-neutral-100 focus:outline-none placeholder-neutral-600 font-sans"
          />
          <button onClick={onClose} aria-label="Close command menu" className="p-1 rounded text-neutral-500 hover:text-neutral-100 transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">
              <p className="text-xs">No results for <span className="text-neutral-400">"{query}"</span></p>
              <p className="text-[10px] font-mono mt-1">Try searching by tag, title, or category</p>
            </div>
          ) : (
            <div className="space-y-4 p-1">
              {/* ── Section header helper ── */}
              {q === '' && (
                <p className="px-2 text-[9px] font-mono text-neutral-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Recent
                </p>
              )}

              {/* Projects */}
              {projectResults.length > 0 && (
                <div className="space-y-0.5">
                  {q !== '' && (
                    <p className="px-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Projects</p>
                  )}
                  {projectResults.map(r => {
                    const p = r.item as Project;
                    const idx = cursor++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={p.id}
                        role="option"
                        aria-selected={isActive}
                        data-idx={idx}
                        onClick={() => select(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isActive ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 font-medium min-w-0">
                          <Folder className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                          <span className="truncate">{p.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            p.category === 'Backend'  ? 'bg-blue-950/40 text-blue-400' :
                            p.category === 'Frontend' ? 'bg-indigo-950/40 text-indigo-400' :
                            p.category === 'Mobile'   ? 'bg-amber-950/40 text-amber-400' :
                                                        'bg-emerald-950/40 text-emerald-400'
                          }`}>{p.category}</span>
                        </span>
                        <span className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-neutral-500">
                          {p.progress}%
                          {isActive && <ArrowRight className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Tasks */}
              {taskResults.length > 0 && (
                <div className="space-y-0.5">
                  {q !== '' && (
                    <p className="px-2 text-[9px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Tasks</p>
                  )}
                  {taskResults.map(r => {
                    const t = r.item as Task;
                    const idx = cursor++;
                    const isActive = idx === activeIndex;
                    // Highlight matching tags
                    const matchedTags = q ? t.tags.filter(tag => tag.toLowerCase().includes(q)) : [];
                    return (
                      <button
                        key={t.id}
                        role="option"
                        aria-selected={isActive}
                        data-idx={idx}
                        onClick={() => select(r)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isActive ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 font-medium min-w-0">
                          <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${t.status === 'done' ? 'text-emerald-500' : 'text-neutral-500'}`} />
                          <span className="truncate">{t.title}</span>
                          {matchedTags.map(tag => (
                            <span key={tag} className="text-[9px] font-mono text-indigo-400 bg-indigo-950/30 px-1 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                              <Tag className="h-2 w-2" />{tag}
                            </span>
                          ))}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                          t.status === 'done'       ? 'bg-emerald-950/40 text-emerald-400' :
                          t.status === 'inprogress' ? 'bg-amber-950/40 text-amber-400' :
                          t.status === 'inreview'   ? 'bg-indigo-950/40 text-indigo-400' :
                                                      'bg-neutral-900 text-neutral-500'
                        }`}>
                          {STATUS_LABEL[t.status] ?? t.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-neutral-900/40 border-t border-neutral-800 flex items-center justify-between text-[9px] font-mono text-neutral-600 uppercase select-none">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="bg-neutral-800 border border-neutral-700 px-1 py-0.5 rounded text-[8px]">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-neutral-800 border border-neutral-700 px-1 py-0.5 rounded text-[8px]">↵</kbd> Select</span>
          </span>
          <span className="flex items-center gap-1"><kbd className="bg-neutral-800 border border-neutral-700 px-1 py-0.5 rounded text-[8px]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
