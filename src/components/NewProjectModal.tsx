import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { ProjectCategory } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: {
    name: string;
    description: string;
    category: ProjectCategory;
    repository: string;
    activeSprint: string;
  }) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Frontend');
  const [repository, setRepository] = useState('');
  const [activeSprint, setActiveSprint] = useState('Sprint 1 - Backlog');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    onCreate({
      name,
      description,
      category,
      repository: repository.trim() || 'github.com/acme/' + name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      activeSprint: activeSprint.trim()
    });

    // Reset fields
    setName('');
    setDescription('');
    setCategory('Frontend');
    setRepository('');
    setActiveSprint('Sprint 1 - Backlog');
    onClose();
  };

  return (
    <div id="new-project-modal-backdrop" className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div 
        id="new-project-modal-container" 
        className="w-full max-w-lg bg-[#09090b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/80 overflow-hidden"
      >
        {/* Header */}
        <div id="new-project-modal-header" className="flex items-center justify-between p-5 border-b border-neutral-850 bg-[#09090b]">
          <div id="new-project-modal-title-group" className="flex items-center gap-2.5">
            <FolderPlus id="new-project-icon" className="h-4.5 w-4.5 text-neutral-100" />
            <h2 id="new-project-modal-heading" className="text-sm font-sans font-medium text-neutral-100">Create New Project</h2>
          </div>
          <button 
            id="close-project-modal-btn"
            onClick={onClose} 
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors"
          >
            <X id="close-project-modal-icon" className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form id="new-project-form" onSubmit={handleSubmit} className="p-6 space-y-4">
          <div id="form-group-name" className="space-y-1.5">
            <label id="label-project-name" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Project Name</label>
            <input
              id="input-project-name"
              type="text"
              required
              placeholder="e.g. Sentinel Security Shield"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans"
            />
          </div>

          <div id="form-group-description" className="space-y-1.5">
            <label id="label-project-desc" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Description</label>
            <textarea
              id="input-project-desc"
              required
              rows={3}
              placeholder="Provide a clear, brief objective for the project team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans resize-none"
            />
          </div>

          <div id="form-grid-meta" className="grid grid-cols-2 gap-4">
            <div id="form-group-category" className="space-y-1.5">
              <label id="label-project-category" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Category</label>
              <select
                id="select-project-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 font-sans"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
                <option value="AI/Data">AI / Data</option>
              </select>
            </div>

            <div id="form-group-sprint" className="space-y-1.5">
              <label id="label-project-sprint" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Active Sprint</label>
              <input
                id="input-project-sprint"
                type="text"
                placeholder="Sprint 1 - Foundation"
                value={activeSprint}
                onChange={(e) => setActiveSprint(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-sans"
              />
            </div>
          </div>

          <div id="form-group-repo" className="space-y-1.5">
            <label id="label-project-repo" className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">Repository Link</label>
            <input
              id="input-project-repo"
              type="text"
              placeholder="github.com/acme/project-repo"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-hidden focus:border-neutral-500 placeholder-neutral-600 font-mono"
            />
          </div>

          {/* Buttons */}
          <div id="project-form-actions" className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-850">
            <button
              id="cancel-project-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              id="submit-project-btn"
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-md transition-colors shadow-sm"
            >
              Initialize Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
