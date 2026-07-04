import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  useDraggable,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  Plus,
  Search,
  Calendar,
  Folder,
  Tag,
  Pencil,
  GripVertical,
} from 'lucide-react';
import { Project, Task, TeamMember, TaskStatus } from '../types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface KanbanViewProps {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  onNewTask: () => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const COLUMNS: { id: TaskStatus; label: string; accent: string; headerBg: string }[] = [
  { id: 'todo',       label: 'To Do',       accent: 'border-t-neutral-600',  headerBg: '' },
  { id: 'inprogress', label: 'In Progress', accent: 'border-t-amber-500',    headerBg: '' },
  { id: 'inreview',   label: 'In Review',   accent: 'border-t-indigo-500',   headerBg: '' },
  { id: 'done',       label: 'Done',        accent: 'border-t-emerald-500',  headerBg: '' },
];

// ─── Draggable Task Card ─────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  projects: Project[];
  teamMembers: TeamMember[];
  onEditTask: (task: Task) => void;
  isDragOverlay?: boolean;
}

function TaskCard({ task, projects, teamMembers, onEditTask, isDragOverlay = false }: TaskCardProps & React.HTMLAttributes<HTMLDivElement>) {
  const assignee = teamMembers.find(m => m.id === task.assigneeId) ?? { name: 'Unassigned', avatar: '?', role: '' };
  const projectName = projects.find(p => p.id === task.projectId)?.name ?? 'Unknown';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging && !isDragOverlay ? 0.35 : 1 }}
      className={`bg-[#09090b] border ${isDragOverlay ? 'border-indigo-700/60 shadow-2xl shadow-black/60 rotate-1 scale-105' : 'border-neutral-800 hover:border-neutral-700'} p-4 rounded-lg flex flex-col space-y-3 transition-colors group relative select-none`}
    >
      {/* Drag handle + priority + edit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Drag grip */}
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing text-neutral-700 hover:text-neutral-400 transition-colors touch-none"
            tabIndex={-1}
            aria-label="Drag task"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>

          <span
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
        </div>

        <div className="flex items-center gap-1.5">
          <span title={projectName} className="text-[9px] font-mono text-neutral-500 truncate max-w-[90px] flex items-center gap-1">
            <Folder className="h-2.5 w-2.5 text-neutral-600 shrink-0" />
            {projectName.split(' ')[0]}
          </span>
          <button
            onClick={() => onEditTask(task)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-600 hover:text-indigo-400 transition-all"
            title="Edit task"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Title + desc */}
      <div className="space-y-1">
        <h4 className="text-xs font-sans font-medium text-neutral-200 group-hover:text-neutral-100 leading-snug">
          {task.title}
        </h4>
        <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] font-mono text-neutral-500 px-1 py-0.5 bg-neutral-900 rounded border border-neutral-800 flex items-center gap-0.5">
              <Tag className="h-2 w-2 text-neutral-600" />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[9px] font-mono text-neutral-600 px-1 py-0.5">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[9px] font-mono text-neutral-500">
          <Calendar className="h-3 w-3 text-neutral-600 shrink-0" />
          {task.dueDate}
        </div>
        <div
          className="h-5 w-5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center cursor-help"
          title={`${assignee.name} — ${assignee.role}`}
        >
          <span className="text-[9px] font-mono font-medium text-neutral-400">{assignee.avatar}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────────────────────

interface ColumnProps {
  column: typeof COLUMNS[number];
  tasks: Task[];
  projects: Project[];
  teamMembers: TeamMember[];
  onEditTask: (task: Task) => void;
  isOver: boolean;
}

function KanbanColumn({ column, tasks, projects, teamMembers, onEditTask, isOver }: ColumnProps & React.HTMLAttributes<HTMLDivElement>) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 shrink-0 flex flex-col rounded-xl border transition-colors duration-150 ${
        isOver ? 'border-indigo-700/50 bg-indigo-950/10' : 'border-neutral-800 bg-[#09090b]/20'
      } overflow-hidden`}
    >
      {/* Column header */}
      <div className={`px-4 py-3 border-b border-neutral-800/60 flex items-center justify-between border-t-2 ${column.accent}`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans font-semibold text-neutral-200">{column.label}</span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-500 rounded-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className={`py-10 border border-dashed ${isOver ? 'border-indigo-700/40' : 'border-neutral-800'} rounded-lg flex items-center justify-center transition-colors`}>
            <span className="text-[10px] font-mono text-neutral-600 uppercase">
              {isOver ? 'Drop here' : 'Empty'}
            </span>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              projects={projects}
              teamMembers={teamMembers}
              onEditTask={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main KanbanView ─────────────────────────────────────────────────────────

export default function KanbanView({
  projects,
  tasks,
  teamMembers,
  onNewTask,
  onUpdateTaskStatus,
  onEditTask,
  selectedProjectId,
  setSelectedProjectId,
}: KanbanViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [activeTaskId, setActiveTaskId] = useState<UniqueIdentifier | null>(null);
  const [overColumnId, setOverColumnId] = useState<TaskStatus | null>(null);

  // dnd-kit sensors — require 8px movement before drag starts (prevents accidental drags)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Filtered tasks
  const filteredTasks = tasks.filter(task => {
    if (selectedProjectId && task.projectId !== selectedProjectId) return false;
    if (selectedAssigneeId !== 'all' && task.assigneeId !== selectedAssigneeId) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q) || task.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) ?? null : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as TaskStatus | null;
    if (overId && COLUMNS.some(c => c.id === overId)) {
      setOverColumnId(overId);
    } else {
      // Dragging over another task — find its column
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) setOverColumnId(overTask.status);
    }
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveTaskId(null);
    setOverColumnId(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Over a column id directly
    let targetStatus: TaskStatus | null = null;
    if (COLUMNS.some(c => c.id === over.id)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Over another task — use its column
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) targetStatus = overTask.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  }, [tasks, onUpdateTaskStatus]);

  const hasFilters = selectedProjectId || selectedAssigneeId !== 'all' || selectedPriority !== 'all' || searchQuery !== '';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b]">
      {/* Filters toolbar */}
      <div className="p-4 border-b border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-end gap-3">
          {/* Project filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase">Project</span>
            <select
              value={selectedProjectId || 'all'}
              onChange={e => setSelectedProjectId(e.target.value === 'all' ? null : e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-neutral-600 min-w-[140px]"
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase">Assignee</span>
            <select
              value={selectedAssigneeId}
              onChange={e => setSelectedAssigneeId(e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-neutral-600 min-w-[130px]"
            >
              <option value="all">All Members</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-neutral-500 uppercase">Priority</span>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 focus:outline-none focus:border-neutral-600"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => { setSelectedProjectId(null); setSelectedAssigneeId('all'); setSelectedPriority('all'); setSearchQuery(''); }}
              className="px-2 py-1.5 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded transition-colors"
            >
              RESET
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-52 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-100 focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
            />
          </div>

          <button
            onClick={onNewTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-white text-black text-xs font-medium rounded-md transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Kanban board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto p-6 flex flex-row gap-6 items-stretch min-h-0">
          {COLUMNS.map(column => {
            const columnTasks = filteredTasks.filter(t => t.status === column.id);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                projects={projects}
                teamMembers={teamMembers}
                onEditTask={onEditTask}
                isOver={overColumnId === column.id && activeTaskId !== null}
              />
            );
          })}
        </div>

        {/* Drag overlay — rendered on top of everything while dragging */}
        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              projects={projects}
              teamMembers={teamMembers}
              onEditTask={onEditTask}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
