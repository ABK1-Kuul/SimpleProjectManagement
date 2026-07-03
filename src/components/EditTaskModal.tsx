import React, { useState, useEffect } from 'react';
import { X, Calendar, Pencil } from 'lucide-react';
import { Task, Project, TeamMember, TaskPriority, TaskStatus } from '../types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  teamMembers: TeamMember[];
  onSave: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'inreview', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

export default function EditTaskModal({
  task,
  isOpen,
  onClose,
  projects,
  teamMembers,
  onSave,
  onDelete,
}: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync fields when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setProjectId(task.projectId);
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate);
      setTagInput(task.tags.join(', '));
      setConfirmDelete(false);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      const tags = tagInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      await onSave(task.id, { title: title.trim(), description: description.trim(), priority, status, projectId, assigneeId, dueDate, tags });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Pencil className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-sans font-medium text-neutral-100">Edit Task</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
              >
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Priority</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-[10px] font-mono rounded uppercase transition-all border ${
                      priority === p
                        ? p === 'high' ? 'bg-rose-950/45 border-rose-700/80 text-rose-300 font-semibold'
                          : p === 'medium' ? 'bg-amber-950/45 border-amber-700/80 text-amber-300 font-semibold'
                          : 'bg-neutral-800 border-neutral-600 text-neutral-200 font-semibold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project + Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Project</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
              >
                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Due Date</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Tags (comma sep.)</label>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="auth, redis, bug"
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 placeholder-neutral-600 font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-all border ${
                confirmDelete
                  ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white'
                  : 'bg-transparent border-neutral-800 text-rose-500 hover:border-rose-800 hover:bg-rose-950/30'
              }`}
            >
              {isDeleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete Task'}
            </button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
