import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MoreHorizontal,
  ChevronRight,
  Folder,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Project, Task, TeamMember, TaskStatus, TaskPriority } from '../types';

interface KanbanViewProps {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  onNewTask: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: 'border-t-neutral-600 bg-[#09090b]/20' },
  { id: 'inprogress', label: 'In Progress', color: 'border-t-amber-500 bg-[#09090b]/20' },
  { id: 'inreview', label: 'In Review', color: 'border-t-indigo-500 bg-[#09090b]/20' },
  { id: 'done', label: 'Done', color: 'border-t-emerald-500 bg-[#09090b]/20' },
];

export default function KanbanView({
  projects,
  tasks,
  teamMembers,
  onNewTask,
  onUpdateTaskStatus,
  selectedProjectId,
  setSelectedProjectId
}: KanbanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Filter Tasks based on all filter parameters
  const filteredTasks = tasks.filter((task) => {
    // Project filter
    if (selectedProjectId && task.projectId !== selectedProjectId) return false;
    
    // Assignee filter
    if (selectedAssigneeId !== 'all' && task.assigneeId !== selectedAssigneeId) return false;
    
    // Priority filter
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    
    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(query);
      const matchDesc = task.description.toLowerCase().includes(query);
      const matchTags = task.tags.some(tag => tag.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchTags;
    }

    return true;
  });

  // Get project information
  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'Unknown Project';
  };

  // Get assignee information
  const getAssignee = (assigneeId: string) => {
    return teamMembers.find((m) => m.id === assigneeId) || {
      name: 'Unassigned',
      avatar: '?',
      role: 'Staff'
    };
  };

  // Get task columns counts
  const getColumnTaskCount = (status: TaskStatus) => {
    return filteredTasks.filter((t) => t.status === status).length;
  };

  // Quick move helpers
  const moveLeft = (task: Task) => {
    const statuses: TaskStatus[] = ['todo', 'inprogress', 'inreview', 'done'];
    const idx = statuses.indexOf(task.status);
    if (idx > 0) {
      onUpdateTaskStatus(task.id, statuses[idx - 1]);
    }
  };

  const moveRight = (task: Task) => {
    const statuses: TaskStatus[] = ['todo', 'inprogress', 'inreview', 'done'];
    const idx = statuses.indexOf(task.status);
    if (idx < statuses.length - 1) {
      onUpdateTaskStatus(task.id, statuses[idx + 1]);
    }
  };

  return (
    <div id="kanban-view-root" className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
      {/* Filters Toolbar */}
      <div id="kanban-filters-bar" className="p-4 border-b border-neutral-800 bg-[#09090b]/80 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none shrink-0">
        
        {/* Filters Left */}
        <div id="kanban-filters-left" className="flex flex-wrap items-center gap-3">
          {/* Project Filter */}
          <div id="filter-group-project" className="flex flex-col">
            <span id="filter-lbl-project" className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Project</span>
            <select
              id="kanban-filter-project"
              value={selectedProjectId || 'all'}
              onChange={(e) => setSelectedProjectId(e.target.value === 'all' ? null : e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 font-sans focus:outline-hidden focus:border-neutral-600 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div id="filter-group-assignee" className="flex flex-col">
            <span id="filter-lbl-assignee" className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Assignee</span>
            <select
              id="kanban-filter-assignee"
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 font-sans focus:outline-hidden focus:border-neutral-600 cursor-pointer min-w-[130px]"
            >
              <option value="all">All Members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div id="filter-group-priority" className="flex flex-col">
            <span id="filter-lbl-priority" className="text-[9px] font-mono text-neutral-500 uppercase mb-1">Priority</span>
            <select
              id="kanban-filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 font-sans focus:outline-hidden focus:border-neutral-600 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(selectedProjectId || selectedAssigneeId !== 'all' || selectedPriority !== 'all' || searchQuery !== '') && (
            <button
              id="clear-filters-btn"
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedAssigneeId('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="mt-4 px-2 py-1 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded transition-colors cursor-pointer"
            >
              RESET
            </button>
          )}
        </div>

        {/* Filters Right */}
        <div id="kanban-filters-right" className="flex items-center gap-3">
          {/* Search box */}
          <div id="filter-search-container" className="relative flex items-center">
            <Search id="filter-search-icon" className="absolute left-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              id="kanban-search-input"
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 w-full md:w-52 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans"
            />
          </div>

          {/* Create Task Action */}
          <button
            id="add-task-board-btn"
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-white text-black text-xs font-sans font-medium rounded-md transition-all duration-150 cursor-pointer shadow-sm mt-4 md:mt-0 whitespace-nowrap"
          >
            <Plus id="add-task-icon" className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Grid of Columns (Flex Column on Mobile, Grid on Desktop) */}
      <div id="kanban-board-grid" className="flex-1 overflow-x-auto p-6 flex flex-row gap-6 items-stretch min-h-0">
        {COLUMNS.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          return (
            <div 
              id={`kanban-column-${column.id}`}
              key={column.id}
              className={`w-72 shrink-0 flex flex-col rounded-xl border border-neutral-800 bg-[#09090b]/20 overflow-hidden`}
            >
              {/* Column Header */}
              <div 
                id={`kanban-column-header-${column.id}`}
                className={`px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between border-t-2 ${column.color}`}
              >
                <div id={`col-title-group-${column.id}`} className="flex items-center gap-2">
                  <span id={`col-label-${column.id}`} className="text-xs font-sans font-semibold text-neutral-200 tracking-tight">{column.label}</span>
                  <span id={`col-badge-${column.id}`} className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-500 rounded-sm font-medium">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div 
                id={`kanban-tasks-list-${column.id}`}
                className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar"
              >
                {columnTasks.length === 0 ? (
                  <div id={`col-empty-${column.id}`} className="py-12 px-4 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center text-center">
                    <span id={`empty-indicator-${column.id}`} className="text-[10px] font-mono text-neutral-600 uppercase">Empty Column</span>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const assignee = getAssignee(task.assigneeId);
                    return (
                      <div
                        id={`task-card-${task.id}`}
                        key={task.id}
                        className="bg-[#09090b] border border-neutral-800 hover:border-neutral-700 p-4 rounded-lg flex flex-col justify-between space-y-3 transition-all duration-150 shadow-xs hover:shadow-black/20 group relative"
                      >
                        {/* Task Priority & Project */}
                        <div id={`task-card-meta-${task.id}`} className="flex items-center justify-between">
                          <span 
                            id={`task-priority-${task.id}`}
                            className={`px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider rounded font-semibold ${
                              task.priority === 'high' 
                                ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' 
                                : task.priority === 'medium' 
                                ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40' 
                                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                            }`}
                          >
                            {task.priority}
                          </span>
                          
                          <span 
                            id={`task-project-tag-${task.id}`}
                            title={getProjectName(task.projectId)}
                            className="text-[9px] font-mono text-neutral-500 truncate max-w-[120px] flex items-center gap-1"
                          >
                            <Folder id={`task-folder-${task.id}`} className="h-2.5 w-2.5 text-neutral-600 shrink-0" />
                            {getProjectName(task.projectId).split(' ')[0]}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div id={`task-card-content-${task.id}`} className="space-y-1">
                          <h4 id={`task-title-${task.id}`} className="text-xs font-sans font-medium text-neutral-200 group-hover:text-neutral-100 transition-colors leading-snug">
                            {task.title}
                          </h4>
                          <p id={`task-desc-${task.id}`} className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Tags list */}
                        <div id={`task-tags-${task.id}`} className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <span 
                              id={`task-tag-${task.id}-${tag}`}
                              key={tag} 
                              className="text-[9px] font-mono text-neutral-500 px-1 py-0.5 bg-neutral-900 rounded border border-neutral-850 flex items-center gap-0.5"
                            >
                              <Tag id={`tag-icon-${task.id}-${tag}`} className="h-2 w-2 text-neutral-600" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Assignee & Due Date Footer */}
                        <div id={`task-card-footer-${task.id}`} className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                          <div id={`task-due-group-${task.id}`} className="flex items-center gap-1 text-[9px] font-mono text-neutral-500">
                            <Calendar id={`due-cal-${task.id}`} className="h-3 w-3 text-neutral-650 shrink-0" />
                            {task.dueDate}
                          </div>

                          <div 
                            id={`task-assignee-avatar-${task.id}`}
                            className="h-5 w-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-help shadow-inner"
                            title={`${assignee.name} (${assignee.role})`}
                          >
                            <span id={`task-assignee-initials-${task.id}`} className="text-[9px] font-mono font-medium text-neutral-450">{assignee.avatar}</span>
                          </div>
                        </div>

                        {/* Quick state-switching overlay actions */}
                        <div id={`task-card-controls-${task.id}`} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-[#09090b] p-1 rounded-md border border-neutral-800 shadow-lg">
                          <button
                            id={`task-move-left-${task.id}`}
                            onClick={() => moveLeft(task)}
                            disabled={task.status === 'todo'}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-500 cursor-pointer"
                            title="Move left"
                          >
                            <ArrowLeft id={`move-left-icon-${task.id}`} className="h-3 w-3" />
                          </button>
                          
                          <select
                            id={`task-col-select-${task.id}`}
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                            className="bg-neutral-900 border border-neutral-800 text-[10px] font-sans text-neutral-300 py-0.5 px-1 rounded focus:outline-hidden focus:border-neutral-600 cursor-pointer"
                          >
                            <option value="todo">To Do</option>
                            <option value="inprogress">In Progress</option>
                            <option value="inreview">In Review</option>
                            <option value="done">Done</option>
                          </select>

                          <button
                            id={`task-move-right-${task.id}`}
                            onClick={() => moveRight(task)}
                            disabled={task.status === 'done'}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-500 cursor-pointer"
                            title="Move right"
                          >
                            <ArrowRight id={`move-right-icon-${task.id}`} className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
