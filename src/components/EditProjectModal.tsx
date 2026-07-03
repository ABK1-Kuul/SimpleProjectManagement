import React, { useState, useEffect } from 'react';
import { X, FolderEdit } from 'lucide-react';
import { Project, ProjectCategory } from '../types';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, updates: Partial<Project>) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

export default function EditProjectModal({ project, isOpen, onClose, onSave, onDelete }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Frontend');
  const [repository, setRepository] = useState('');
  const [activeSprint, setActiveSprint] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setCategory(project.category);
      setRepository(project.repository);
      setActiveSprint(project.activeSprint);
      setConfirmDelete(false);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave(project.id, { name: name.trim(), description: description.trim(), category, repository: repository.trim(), activeSprint: activeSprint.trim() });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setIsDeleting(true);
    try {
      await onDelete(project.id);
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
            <FolderEdit className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-sans font-medium text-neutral-100">Edit Project</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/Data">AI / Data</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Active Sprint</label>
              <input
                type="text"
                value={activeSprint}
                onChange={e => setActiveSprint(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-sans"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Repository</label>
            <input
              type="text"
              value={repository}
              onChange={e => setRepository(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-2">
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
                {isDeleting ? 'Deleting…' : confirmDelete ? 'Confirm Delete' : 'Delete Project'}
              </button>
              {confirmDelete && (
                <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-neutral-500 hover:text-neutral-300">
                  Cancel
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-4 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-md transition-colors disabled:opacity-50">
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
