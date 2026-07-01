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

import { Project, Task, TeamMember, Activity, Milestone, TaskStatus, TaskPriority, ProjectCategory } from './types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_TASKS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_ACTIVITIES, 
  INITIAL_MILESTONES 
} from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  // Filter or navigation context state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modal visual states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);

  // Recalculate Project Progress based on completed tasks
  const recalculateProgress = (projId: string, currentTasks: Task[]) => {
    const projectTasks = currentTasks.filter(t => t.projectId === projId);
    if (projectTasks.length === 0) return 0;
    const completedCount = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completedCount / projectTasks.length) * 100);
  };

  // Keyboard shortcut listener for Command Menu (⌘K)
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

  // Update Task Status
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((task) => {
        if (task.id === taskId) {
          const originalStatus = task.status;
          if (originalStatus !== newStatus) {
            // Log task movement activity
            const member = teamMembers.find(m => m.id === task.assigneeId) || { name: 'Someone' };
            const proj = projects.find(p => p.id === task.projectId) || { name: 'project' };
            const newAct: Activity = {
              id: `act-${Date.now()}`,
              user: member.name,
              avatar: member.avatar || '??',
              action: `shifted status of "${task.title.substring(0, 24)}..." to`,
              target: newStatus.toUpperCase(),
              timestamp: 'Just now',
              type: 'task'
            };
            setActivities(prevAct => [newAct, ...prevAct]);
          }
          return { ...task, status: newStatus };
        }
        return task;
      });

      // Recalculate progress for the affected project
      const targetTask = prevTasks.find(t => t.id === taskId);
      if (targetTask) {
        const newProjProgress = recalculateProgress(targetTask.projectId, updated);
        setProjects((prevProjs) => 
          prevProjs.map((p) => 
            p.id === targetTask.projectId 
              ? { ...p, progress: newProjProgress, lastUpdated: 'Just now' } 
              : p
          )
        );

        // Update milestones progress
        setMilestones((prevMilestones) =>
          prevMilestones.map((m) => {
            if (m.projectId === targetTask.projectId) {
              const completedTasksCount = updated.filter(t => t.projectId === m.projectId && t.status === 'done').length;
              const totalTasksCount = updated.filter(t => t.projectId === m.projectId).length;
              const pct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
              return { 
                ...m, 
                progress: pct, 
                status: pct === 100 ? 'completed' : m.status 
              };
            }
            return m;
          })
        );
      }

      return updated;
    });
  };

  // Reassign task
  const handleReassignTask = (taskId: string, newAssigneeId: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((task) => {
        if (task.id === taskId) {
          const originalAssignee = task.assigneeId;
          if (originalAssignee !== newAssigneeId) {
            const member = teamMembers.find(m => m.id === newAssigneeId) || { name: 'Someone', avatar: '??' };
            const newAct: Activity = {
              id: `act-${Date.now()}`,
              user: member.name,
              avatar: member.avatar,
              action: `accepted deployment dispatch for`,
              target: task.title.substring(0, 24) + '...',
              timestamp: 'Just now',
              type: 'task'
            };
            setActivities(prevAct => [newAct, ...prevAct]);
          }
          return { ...task, assigneeId: newAssigneeId };
        }
        return task;
      });
      return updated;
    });
  };

  // Create Project Callback
  const handleCreateProject = (newProjData: {
    name: string;
    description: string;
    category: ProjectCategory;
    repository: string;
    activeSprint: string;
  }) => {
    const newId = `p-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: newProjData.name,
      description: newProjData.description,
      progress: 0,
      activeSprint: newProjData.activeSprint,
      category: newProjData.category,
      repository: newProjData.repository,
      issuesCount: 3,
      openIssues: 3,
      lastUpdated: 'Just now',
      teamIds: ['1', '2'] // Default core team members allocated
    };

    // Auto-create some helper boilerplate tasks for this new project
    const defaultTasks: Task[] = [
      {
        id: `t-${Date.now()}-1`,
        title: `Draft system design specifications`,
        description: `Map microservices schema, state matrices, and security tokens for ${newProjData.name}.`,
        status: 'todo',
        priority: 'high',
        projectId: newId,
        assigneeId: '1', // Abdselam
        dueDate: '2026-07-10',
        tags: ['architecture', 'planning']
      },
      {
        id: `t-${Date.now()}-2`,
        title: `Configure base pipeline scaffolding`,
        description: `Bootstrap project structure, ESLint validation, Tailwind configuration, and docker config.`,
        status: 'todo',
        priority: 'medium',
        projectId: newId,
        assigneeId: '2', // Sarah Jenkins
        dueDate: '2026-07-12',
        tags: ['setup', 'ci-cd']
      }
    ];

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      projectId: newId,
      name: `Release V1 Core Interface`,
      dueDate: '2026-07-30',
      status: 'pending',
      progress: 0
    };

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: 'Elena Rostova',
      avatar: 'ER',
      action: 'initialized repository context',
      target: newProjData.repository,
      timestamp: 'Just now',
      type: 'project'
    };

    setProjects(prev => [newProject, ...prev]);
    setTasks(prev => [...prev, ...defaultTasks]);
    setMilestones(prev => [...prev, newMilestone]);
    setActivities(prev => [newActivity, ...prev]);
    
    // Jump straight to Dashboard to see the new project
    setActiveTab('dashboard');
  };

  // Create Task Callback
  const handleCreateTask = (newTaskData: {
    title: string;
    description: string;
    priority: TaskPriority;
    projectId: string;
    assigneeId: string;
    dueDate: string;
    tags: string[];
  }) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: newTaskData.title,
      description: newTaskData.description,
      status: 'todo',
      priority: newTaskData.priority,
      projectId: newTaskData.projectId,
      assigneeId: newTaskData.assigneeId,
      dueDate: newTaskData.dueDate,
      tags: newTaskData.tags
    };

    const member = teamMembers.find(m => m.id === newTaskData.assigneeId) || { name: 'Someone', avatar: '??' };
    const project = projects.find(p => p.id === newTaskData.projectId) || { name: 'Unknown' };

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: member.name,
      avatar: member.avatar,
      action: `received assignment for "${newTaskData.title.substring(0, 20)}..." in`,
      target: project.name,
      timestamp: 'Just now',
      type: 'task'
    };

    setTasks(prev => [newTask, ...prev]);
    setActivities(prev => [newActivity, ...prev]);

    // Recalculate progress of that project because count of tasks increased
    setTimeout(() => {
      setTasks((latestTasks) => {
        const newProjProgress = recalculateProgress(newTaskData.projectId, latestTasks);
        setProjects((prevProjs) => 
          prevProjs.map((p) => 
            p.id === newTaskData.projectId 
              ? { ...p, progress: newProjProgress, lastUpdated: 'Just now' } 
              : p
          )
        );
        return latestTasks;
      });
    }, 50);
  };

  // Simulate developer action callback
  const handleSimulateCommit = () => {
    // Select a random developer
    const randomDev = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    // Select a random project
    const randomProj = projects[Math.floor(Math.random() * projects.length)];

    const commitActions = [
      { text: 'pushed ref update to origin/main on', type: 'commit' as const },
      { text: 'resolved merge conflict inside routing file on', type: 'commit' as const },
      { text: 'patched critical JWT signature checks on', type: 'project' as const },
      { text: 'optimized memory index lookup latency for', type: 'commit' as const },
      { text: 'integrated Tailwind variables configuration on', type: 'task' as const }
    ];
    
    const chosenAction = commitActions[Math.floor(Math.random() * commitActions.length)];
    const newAct: Activity = {
      id: `act-sim-${Date.now()}`,
      user: randomDev.name,
      avatar: randomDev.avatar,
      action: chosenAction.text,
      target: randomProj.name,
      timestamp: 'Just now',
      type: chosenAction.type
    };

    // Prepend activity
    setActivities(prev => [newAct, ...prev]);

    // Randomly shift progress of one task to "done" to make the simulation look live!
    const activeTasksOfProj = tasks.filter(t => t.projectId === randomProj.id && t.status !== 'done');
    if (activeTasksOfProj.length > 0) {
      const taskToFinish = activeTasksOfProj[Math.floor(Math.random() * activeTasksOfProj.length)];
      handleUpdateTaskStatus(taskToFinish.id, 'done');
    }
  };

  // Navigation handlers from dashboard cards or command menu
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

  // Determine current view title
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
