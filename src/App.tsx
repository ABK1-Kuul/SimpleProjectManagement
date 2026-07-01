/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import KanbanView from './components/KanbanView';
import AnalyticsView from './components/AnalyticsView';
import TeamView from './components/TeamView';
import NewProjectModal from './components/NewProjectModal';
import NewTaskModal from './components/NewTaskModal';
import CommandMenu from './components/CommandMenu';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Project, Task, TeamMember, Activity, Milestone, TaskStatus, TaskPriority, ProjectCategory } from './types';

// ─── Inner workspace that is only rendered after login ────────────────────────
function Workspace() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  const refreshData = async () => {
    try {
      const [projectsRes, tasksRes, teamRes, activitiesRes, milestonesRes] = await Promise.all([
        fetch('/api/projects', { credentials: 'include' }),
        fetch('/api/tasks', { credentials: 'include' }),
        fetch('/api/team', { credentials: 'include' }),
        fetch('/api/activities', { credentials: 'include' }),
        fetch('/api/milestones', { credentials: 'include' })
      ]);

      if (!projectsRes.ok || !tasksRes.ok || !teamRes.ok || !activitiesRes.ok || !milestonesRes.ok) {
        throw new Error('Server returned an error status while retrieving data');
      }

      const [projectsData, tasksData, teamData, activitiesData, milestonesData] = await Promise.all([
        projectsRes.json(),
        tasksRes.json(),
        teamRes.json(),
        activitiesRes.json(),
        milestonesRes.json()
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setTeamMembers(teamData);
      setActivities(activitiesData);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Failed to sync context with backend database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
      );

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('API refused task status change');
      await refreshData();
    } catch (error) {
      console.error('Failed to update task status:', error);
      refreshData();
    }
  };

  const handleReassignTask = async (taskId: string, newAssigneeId: string) => {
    try {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, assigneeId: newAssigneeId } : task))
      );

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assigneeId: newAssigneeId })
      });

      if (!res.ok) throw new Error('API refused task reassignment');
      await refreshData();
    } catch (error) {
      console.error('Failed to reassign task assignee:', error);
      refreshData();
    }
  };

  const handleCreateProject = async (newProjData: {
    name: string;
    description: string;
    category: ProjectCategory;
    repository: string;
    activeSprint: string;
  }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProjData)
      });

      if (!res.ok) throw new Error('Failed to create project on server');
      await refreshData();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateTask = async (newTaskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    projectId: string;
    assigneeId: string;
    dueDate: string;
    tags: string[];
  }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTaskData)
      });

      if (!res.ok) throw new Error('Failed to create task on server');
      await refreshData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleSimulateCommit = async () => {
    if (teamMembers.length === 0 || projects.length === 0) return;

    const randomDev = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    const randomProj = projects[Math.floor(Math.random() * projects.length)];

    const commitActions = [
      { text: 'pushed ref update to origin/main on', type: 'commit' as const },
      { text: 'resolved merge conflict inside routing file on', type: 'commit' as const },
      { text: 'patched critical JWT signature checks on', type: 'project' as const },
      { text: 'optimized memory index lookup latency for', type: 'commit' as const },
      { text: 'integrated Tailwind variables configuration on', type: 'task' as const }
    ];

    const chosenAction = commitActions[Math.floor(Math.random() * commitActions.length)];

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user: randomDev.name,
          avatar: randomDev.avatar,
          action: chosenAction.text,
          target: randomProj.name,
          type: chosenAction.type
        })
      });

      if (!res.ok) throw new Error('Failed to log activity simulation');

      const activeTasksOfProj = tasks.filter(t => t.projectId === randomProj.id && t.status !== 'done');
      if (activeTasksOfProj.length > 0) {
        const taskToFinish = activeTasksOfProj[Math.floor(Math.random() * activeTasksOfProj.length)];
        await fetch(`/api/tasks/${taskToFinish.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'done' })
        });
      }

      await refreshData();
    } catch (error) {
      console.error('Error simulating commit activity:', error);
    }
  };

  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    setActiveTab('kanban');
  };

  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedProjectId(task.projectId);
      setActiveTab('kanban');
    }
  };

  // ─── Auth-loading screen ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div id="auth-loading-viewport" className="flex h-screen w-screen bg-[#09090b] items-center justify-center text-neutral-400 font-mono text-xs select-none">
        <div id="auth-loading-box" className="flex flex-col items-center gap-3">
          <div id="auth-loading-spinner" className="h-6 w-6 rounded-full border-2 border-neutral-800 border-t-indigo-500 animate-spin"></div>
          <span id="auth-loading-text" className="tracking-wider uppercase">Authenticating...</span>
        </div>
      </div>
    );
  }

  // ─── Login gate ─────────────────────────────────────────────────────────────
  if (!user) {
    return <LoginPage />;
  }

  // ─── Data loading screen ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div id="loading-viewport" className="flex h-screen w-screen bg-[#09090b] items-center justify-center text-neutral-400 font-mono text-xs select-none">
        <div id="loading-spinner-box" className="flex flex-col items-center gap-3">
          <div id="loading-spinner" className="h-6 w-6 rounded-full border-2 border-neutral-800 border-t-white animate-spin"></div>
          <span id="loading-text" className="tracking-wider uppercase">Loading Workspace Context...</span>
        </div>
      </div>
    );
  }

  // ─── View titles ─────────────────────────────────────────────────────────────
  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'DASHBOARD OVERVIEW', subtitle: 'Global metrics & projects' },
    kanban: { title: 'KANBAN AGIL BOARD', subtitle: 'Work coordination pipeline' },
    analytics: { title: 'CROSS-PROJECT MILESTONES', subtitle: 'Schedules & live events stream' },
    team: { title: 'RESOURCE ALLOCATION', subtitle: 'Developer workloads' }
  };

  const currentMeta = viewTitles[activeTab] || { title: 'WORKSPACE', subtitle: 'Active stream' };

  return (
    <div id="app-viewport-wrapper" className="flex h-screen w-screen bg-[#09090b] text-neutral-300 font-sans overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectCount={projects.length}
        taskCount={tasks.filter(t => t.status !== 'done').length}
      />

      {/* Main Workspace Frame */}
      <div id="main-workspace-frame" className="flex-1 flex flex-col min-w-0 bg-[#09090b]">

        {/* Global Toolbar Header */}
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenSearch={() => setIsCommandMenuOpen(true)}
          onSimulateCommit={handleSimulateCommit}
        />

        {/* Tab View Transition Panel */}
        <main id="workspace-view-container" className="flex-1 flex flex-col min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              id={`tab-container-${activeTab}`}
              key={activeTab}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  projects={projects}
                  tasks={tasks}
                  teamMembers={teamMembers}
                  onNewProject={() => setIsProjectModalOpen(true)}
                  onSelectProject={handleSelectProject}
                  onViewTasks={() => setActiveTab('kanban')}
                />
              )}

              {activeTab === 'kanban' && (
                <KanbanView
                  projects={projects}
                  tasks={tasks}
                  teamMembers={teamMembers}
                  onNewTask={() => setIsTaskModalOpen(true)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  selectedProjectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  projects={projects}
                  activities={activities}
                  milestones={milestones}
                />
              )}

              {activeTab === 'team' && (
                <TeamView
                  teamMembers={teamMembers}
                  tasks={tasks}
                  projects={projects}
                  onReassignTask={handleReassignTask}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Modals & Overlays */}
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

// ─── Root with Auth Provider ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  );
}
