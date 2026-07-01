import React, { useState } from 'react';
import { X, Calendar, ClipboardList } from 'lucide-react';
import { Project, TeamMember, TaskPriority } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  teamMembers: TeamMember[];
  onCreate: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    projectId: string;
    assigneeId: string;
    dueDate: string;
    tags: string[];
  }) => void;
}

export default function NewTaskModal({ isOpen, onClose, projects, teamMembers, onCreate }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-07-05');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !projectId || !assigneeId) return;

    // Split tags
    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      projectId,
      assigneeId,
      dueDate,
      tags: tags.length ? tags : ['feature'],
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTagInput('');
    onClose();
  };

  return (
    <div id="new-task-modal-backdrop" className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div 
        id="new-task-modal-container" 
        className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden"
      >
        {/* Header */}
        <div id="new-task-modal-header" className="flex items-center justify-between p-5 border-b border-neutral-850 bg-[#09090b]">
          <div id="new-task-modal-title-group" className="flex items-center gap-2.5">
            <ClipboardList id="new-task-icon" className="h-4.5 w-4.5 text-neutral-100" />
            <h2 id="new-task-modal-heading" className="text-sm font-sans font-medium text-neutral-100">Add Board Task</h2>
          </div>
          <button 
            id="close-task-modal-btn"
            onClick={onClose} 
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors"
          >
            <X id="close-task-modal-icon" className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="new-task-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div id="form-group-task-title" className="space-y-1.5">
            <label id="label-task-title" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Task Title</label>
            <input
              id="input-task-title"
              type="text"
              required
              placeholder="e.g. Implement OIDC token signing verification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans"
            />
          </div>

          <div id="form-group-task-desc" className="space-y-1.5">
            <label id="label-task-desc" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Technical Description</label>
            <textarea
              id="input-task-desc"
              required
              rows={3}
              placeholder="Provide clean instructions, edge-cases or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans resize-none"
            />
          </div>

          {/* Project & Assignee Grid */}
          <div id="task-meta-grid" className="grid grid-cols-2 gap-4">
            <div id="form-group-task-project" className="space-y-1.5">
              <label id="label-task-project" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Parent Project</label>
              <select
                id="select-task-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 font-sans"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div id="form-group-task-assignee" className="space-y-1.5">
              <label id="label-task-assignee" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Assignee</label>
              <select
                id="select-task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 font-sans"
              >
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Date Grid */}
          <div id="task-priority-grid" className="grid grid-cols-2 gap-4">
            <div id="form-group-task-priority" className="space-y-1.5">
              <label id="label-task-priority" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Priority</label>
              <div id="priority-options-container" className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    id={`priority-btn-${p}`}
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 text-[10px] font-mono rounded uppercase transition-all duration-150 border ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-950/45 border-rose-700/80 text-rose-300 font-semibold'
                          : p === 'medium'
                          ? 'bg-amber-950/45 border-amber-700/80 text-amber-300 font-semibold'
                          : 'bg-neutral-800 border-neutral-600 text-neutral-200 font-semibold'
                        : 'bg-neutral-900 border-neutral-850 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div id="form-group-task-duedate" className="space-y-1.5">
              <label id="label-task-duedate" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Due Date</label>
              <div id="duedate-input-container" className="relative flex items-center">
                <Calendar id="calendar-icon" className="absolute left-3 h-3.5 w-3.5 text-neutral-500" />
                <input
                  id="input-task-duedate"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div id="form-group-task-tags" className="space-y-1.5">
            <label id="label-task-tags" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Tags (comma separated)</label>
            <input
              id="input-task-tags"
              type="text"
              placeholder="e.g. security, redis, backend"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div id="task-form-actions" className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-850">
            <button
              id="cancel-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              id="submit-task-btn"
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-md transition-colors shadow-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
