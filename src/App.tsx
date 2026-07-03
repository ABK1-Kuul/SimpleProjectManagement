/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import KanbanView from './components/KanbanView';
import AnalyticsView from './components/AnalyticsView';
import TeamView from './components/TeamView';
import NewProjectModal from './components/NewProjectModal';
import NewTaskModal from './components/NewTaskModal';
import EditTaskModal from './components/EditTaskModal';
import EditProjectModal from './components/EditProjectModal';
import CommandMenu from './components/CommandMenu';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

import {
  useProjects, useTasks, useTeam, useActivities, useMilestones,
  useCreateProject, useUpdateProject, useDeleteProject,
  useCreateTask, useUpdateTaskStatus, useUpdateTask, useReassignTask, useDeleteTask,
} from './hooks/useApi';

import { Project, Task, TaskStatus, TaskPriority, ProjectCategory } from './types';

// ─── Shared loading spinner ───────────────────────────────────────────────────
function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex h-screen w-screen bg-[#09090b] items-center justify-center text-neutral-400 font-mono text-xs select-none">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
        <span className="tracking-wider uppercase">{label}</span>
      </div>
    </div>
  );
}

// ─── Workspace — only rendered after login ────────────────────────────────────
function Workspace() {
  const [activeTab,          setActiveTab]          = useState('dashboard');
  const [selectedProjectId,  setSelectedProjectId]  = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen,    setIsTaskModalOpen]    = useState(false);
  const [isCommandMenuOpen,  setIsCommandMenuOpen]  = useState(false);
  const [editingTask,        setEditingTask]        = useState<Task | null>(null);
  const [editingProject,     setEditingProject]     = useState<Project | null>(null);

  // ─── React Query data ───────────────────────────────────────────────────────
  const { data: projects    = [], isLoading: lProj } = useProjects();
  const { data: tasks       = [], isLoading: lTask } = useTasks();
  const { data: teamMembers = [], isLoading: lTeam } = useTeam();
  const { data: activities  = [], isLoading: lAct  } = useActivities();
  const { data: milestones  = [], isLoading: lMil  } = useMilestones();

  const isDataLoading = lProj || lTask || lTeam || lAct || lMil;

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const createProject    = useCreateProject();
  const updateProject    = useUpdateProject();
  const deleteProject    = useDeleteProject();
  const createTask       = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const updateTask       = useUpdateTask();
  const reassignTask     = useReassignTask();
  const deleteTask       = useDeleteTask();

  // ─── ⌘K shortcut ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) =>
    updateTaskStatus.mutate({ id: taskId, status: newStatus });

  const handleReassignTask = (taskId: string, newAssigneeId: string) =>
    reassignTask.mutate({ id: taskId, assigneeId: newAssigneeId });

  const handleCreateProject = (data: {
    name: string; description: string; category: ProjectCategory;
    repository: string; activeSprint: string;
  }) => createProject.mutate(data, { onSuccess: () => setActiveTab('dashboard') });

  const handleCreateTask = (data: {
    title: string; description: string; priority: TaskPriority;
    projectId: string; assigneeId: string; dueDate: string; tags: string[];
  }) => createTask.mutate(data);

  // Async wrappers so modals can await and then close themselves
  const handleEditTask = (taskId: string, updates: Partial<Task>): Promise<void> =>
    new Promise((res, rej) =>
      updateTask.mutate({ id: taskId, updates }, { onSuccess: () => res(), onError: () => rej() })
    );

  const handleDeleteTask = (taskId: string): Promise<void> =>
    new Promise((res, rej) =>
      deleteTask.mutate(taskId, { onSuccess: () => res(), onError: () => rej() })
    );

  const handleEditProject = (projectId: string, updates: Partial<Project>): Promise<void> =>
    new Promise((res, rej) =>
      updateProject.mutate({ id: projectId, updates }, { onSuccess: () => res(), onError: () => rej() })
    );

  const handleDeleteProject = (projectId: string): Promise<void> =>
    new Promise((res, rej) =>
      deleteProject.mutate(projectId, { onSuccess: () => res(), onError: () => rej() })
    );

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    setActiveTab('kanban');
  };

  const handleSelectTask = (taskId: string) => {
    const t = tasks.find(t => t.id === taskId);
    if (t) { setSelectedProjectId(t.projectId); setActiveTab('kanban'); }
  };

  if (isDataLoading) return <LoadingScreen label="Loading Workspace Context..." />;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'DASHBOARD OVERVIEW',     subtitle: 'Global metrics & projects' },
    kanban:    { title: 'KANBAN BOARD',            subtitle: 'Work coordination pipeline' },
    analytics: { title: 'MILESTONES & ANALYTICS', subtitle: 'Schedules & live events stream' },
    team:      { title: 'RESOURCE ALLOCATION',     subtitle: 'Developer workloads' },
  };
  const meta = viewTitles[activeTab] ?? { title: 'WORKSPACE', subtitle: '' };

  return (
    <div className="flex h-screen w-screen bg-[#09090b] text-neutral-300 font-sans overflow-hidden select-none">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectCount={projects.length}
        taskCount={tasks.filter(t => t.status !== 'done').length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSearch={() => setIsCommandMenuOpen(true)}
        />

        <main className="flex-1 flex flex-col min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  projects={projects} tasks={tasks} teamMembers={teamMembers}
                  onNewProject={() => setIsProjectModalOpen(true)}
                  onSelectProject={handleSelectProject}
                  onEditProject={p => setEditingProject(p)}
                  onViewTasks={() => setActiveTab('kanban')}
                />
              )}
              {activeTab === 'kanban' && (
                <KanbanView
                  projects={projects} tasks={tasks} teamMembers={teamMembers}
                  onNewTask={() => setIsTaskModalOpen(true)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onEditTask={t => setEditingTask(t)}
                  selectedProjectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsView projects={projects} activities={activities} milestones={milestones} />
              )}
              {activeTab === 'team' && (
                <TeamView
                  teamMembers={teamMembers} tasks={tasks} projects={projects}
                  onReassignTask={handleReassignTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Modals ── */}
      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        projects={projects}
        teamMembers={teamMembers}
        onCreate={handleCreateTask}
      />
      <EditTaskModal
        task={editingTask}
        isOpen={editingTask !== null}
        onClose={() => setEditingTask(null)}
        projects={projects}
        teamMembers={teamMembers}
        onSave={handleEditTask}
        onDelete={handleDeleteTask}
      />
      <EditProjectModal
        project={editingProject}
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        onSave={handleEditProject}
        onDelete={handleDeleteProject}
      />
      <CommandMenu
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        projects={projects}
        tasks={tasks}
        onSelectProject={handleSelectProject}
        onSelectTask={handleSelectTask}
      />
    </div>
  );
}

// ─── Auth gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen label="Authenticating..." />;
  if (!user)   return <LoginPage />;
  return <Workspace />;
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
