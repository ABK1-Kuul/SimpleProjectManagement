import React from 'react';
import { 
  Plus, 
  ExternalLink, 
  AlertCircle, 
  GitBranch, 
  Calendar, 
  Grid, 
  ArrowUpRight,
  TrendingUp,
  FolderLock,
  Code
} from 'lucide-react';
import { Project, Task, TeamMember } from '../types';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
  onNewProject: () => void;
  onSelectProject: (projectId: string) => void;
  onViewTasks: () => void;
}

export default function DashboardView({ 
  projects, 
  tasks, 
  teamMembers, 
  onNewProject, 
  onSelectProject,
  onViewTasks
}: DashboardViewProps) {
  
  // Calculate aggregate stats
  const totalProjects = projects.length;
  const averageProgress = totalProjects > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / totalProjects) 
    : 0;
  
  const openTasksCount = tasks.filter(t => t.status !== 'done').length;
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 
    ? Math.round((completedTasksCount / tasks.length) * 100) 
    : 0;

  // Group tasks by project to get issues metrics
  const getProjectTasksStats = (projectId: string) => {
    const projTasks = tasks.filter(t => t.projectId === projectId);
    const completed = projTasks.filter(t => t.status === 'done').length;
    const total = projTasks.length;
    return {
      total,
      completed,
      open: total - completed,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return (
    <div id="dashboard-view-root" className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Upper stats banner */}
      <div id="dashboard-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div id="stat-card-projects" className="bg-[#09090b] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
          <div id="stat-title-group-1" className="flex items-center justify-between">
            <span id="stat-label-projects" className="text-[10px] font-mono text-neutral-500 uppercase">Active Projects</span>
            <span id="stat-trend-projects" className="text-[10px] font-mono text-emerald-500 bg-emerald-950/40 px-1.5 py-0.5 rounded">Live</span>
          </div>
          <div id="stat-value-group-1" className="mt-4 flex items-baseline gap-2">
            <span id="stat-val-projects" className="text-2xl font-semibold text-neutral-100 tracking-tight">{totalProjects}</span>
            <span id="stat-subval-projects" className="text-[11px] font-mono text-neutral-500">Initialized</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div id="stat-card-completion" className="bg-[#09090b] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
          <div id="stat-title-group-2" className="flex items-center justify-between">
            <span id="stat-label-completion" className="text-[10px] font-mono text-neutral-500 uppercase">Avg Progression</span>
            <span id="stat-trend-completion" className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">{averageProgress}% Avg</span>
          </div>
          {/* Linear progress track */}
          <div id="stat-value-group-2" className="mt-4 space-y-1.5">
            <div id="stat-completion-flex" className="flex items-baseline justify-between">
              <span id="stat-val-completion" className="text-2xl font-semibold text-neutral-100 tracking-tight">{averageProgress}%</span>
              <span id="stat-subval-completion" className="text-[10px] font-mono text-neutral-500">Weight</span>
            </div>
            <div id="stat-completion-bar-bg" className="h-1 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                id="stat-completion-bar-fill" 
                className="h-full bg-linear-to-r from-neutral-500 to-neutral-100 transition-all duration-500" 
                style={{ width: `${averageProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div id="stat-card-backlog" className="bg-[#09090b] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
          <div id="stat-title-group-3" className="flex items-center justify-between">
            <span id="stat-label-backlog" className="text-[10px] font-mono text-neutral-500 uppercase">Board Queue</span>
            <span id="stat-trend-backlog" className="text-[10px] font-mono text-amber-500 bg-amber-950/40 px-1.5 py-0.5 rounded">{openTasksCount} Open</span>
          </div>
          <div id="stat-value-group-3" className="mt-4 flex items-baseline justify-between">
            <div id="stat-backlog-sub" className="flex items-baseline gap-2">
              <span id="stat-val-backlog" className="text-2xl font-semibold text-neutral-100 tracking-tight">{tasks.length}</span>
              <span id="stat-subval-backlog" className="text-[11px] font-mono text-neutral-500">Tasks</span>
            </div>
            <button 
              id="view-backlog-btn"
              onClick={onViewTasks}
              className="text-[10px] font-mono text-neutral-400 hover:text-neutral-100 flex items-center gap-0.5 cursor-pointer underline underline-offset-2 decoration-neutral-800"
            >
              Go to Board
              <ArrowUpRight id="view-backlog-arrow" className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Stat 4 */}
        <div id="stat-card-delivery" className="bg-[#09090b] border border-neutral-800 rounded-lg p-4 flex flex-col justify-between group hover:border-neutral-700 transition-colors">
          <div id="stat-title-group-4" className="flex items-center justify-between">
            <span id="stat-label-delivery" className="text-[10px] font-mono text-neutral-500 uppercase">Task Delivery</span>
            <span id="stat-trend-delivery" className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">{completionRate}% Done</span>
          </div>
          <div id="stat-value-group-4" className="mt-4 space-y-1.5">
            <div id="stat-delivery-flex" className="flex items-baseline justify-between">
              <span id="stat-val-delivery" className="text-2xl font-semibold text-neutral-100 tracking-tight">{completedTasksCount}</span>
              <span id="stat-subval-delivery" className="text-[11px] font-mono text-neutral-500">Closed</span>
            </div>
            <div id="stat-delivery-bar-bg" className="h-1 bg-neutral-900 rounded-full overflow-hidden">
              <div 
                id="stat-delivery-bar-fill" 
                className="h-full bg-emerald-500 transition-all duration-500" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Projects list header */}
      <div id="projects-section-header" className="flex items-center justify-between pt-2">
        <div>
          <h2 id="projects-heading" className="text-sm font-sans font-semibold text-neutral-100 tracking-tight">Active Team Projects</h2>
          <p id="projects-subheading" className="text-xs text-neutral-500">Comprehensive overview of development cycles, repository feeds, and scope metrics.</p>
        </div>
        <button
          id="add-project-btn"
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-white text-black text-xs font-sans font-medium rounded-md transition-all duration-150 cursor-pointer shadow-sm"
        >
          <Plus id="add-project-icon" className="h-3.5 w-3.5" />
          Initialize Project
        </button>
      </div>

      {/* Grid of Projects */}
      <div id="projects-grid" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
          const stats = getProjectTasksStats(project.id);
          // Get assigned team members avatars
          const projectMembers = teamMembers.filter(m => project.teamIds.includes(m.id));

          return (
            <div 
              id={`project-card-${project.id}`}
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-[#09090b] border border-neutral-800/80 hover:border-neutral-700 rounded-xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group shadow-xs shadow-black/10"
            >
              {/* Card top */}
              <div id={`project-card-top-${project.id}`} className="p-5 space-y-4">
                {/* Category & Repo link */}
                <div id={`project-card-header-${project.id}`} className="flex items-center justify-between">
                  <span 
                    id={`project-category-${project.id}`}
                    className={`px-2 py-0.5 text-[9px] font-mono font-medium rounded ${
                      project.category === 'Backend' 
                        ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40' 
                        : project.category === 'Frontend'
                        ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40'
                        : project.category === 'Mobile'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
                    }`}
                  >
                    {project.category}
                  </span>
                  
                  <span id={`project-last-updated-${project.id}`} className="text-[10px] font-mono text-neutral-500">
                    Updated {project.lastUpdated}
                  </span>
                </div>

                {/* Title & Desc */}
                <div id={`project-card-info-${project.id}`} className="space-y-1.5">
                  <h3 id={`project-name-${project.id}`} className="text-xs font-sans font-semibold text-neutral-100 group-hover:text-white transition-colors flex items-center justify-between">
                    {project.name}
                    <ArrowUpRight id={`project-arrow-${project.id}`} className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100" />
                  </h3>
                  <p id={`project-desc-${project.id}`} className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Micro metrics */}
                <div id={`project-metrics-${project.id}`} className="grid grid-cols-2 gap-3 pt-2">
                  <div id={`project-sprint-container-${project.id}`} className="bg-neutral-900/40 border border-neutral-800 rounded p-2 flex flex-col justify-center">
                    <span id={`project-sprint-label-${project.id}`} className="text-[8px] font-mono text-neutral-500 uppercase">Active Sprint</span>
                    <span id={`project-sprint-value-${project.id}`} className="text-[10px] font-sans font-medium text-neutral-300 truncate mt-0.5 flex items-center gap-1">
                      <Calendar id={`sprint-cal-${project.id}`} className="h-3 w-3 text-neutral-500 shrink-0" />
                      {project.activeSprint.split(' - ')[0]}
                    </span>
                  </div>

                  <div id={`project-repo-container-${project.id}`} className="bg-neutral-900/40 border border-neutral-800 rounded p-2 flex flex-col justify-center">
                    <span id={`project-repo-label-${project.id}`} className="text-[8px] font-mono text-neutral-500 uppercase">Repository</span>
                    <a 
                      id={`project-repo-link-${project.id}`}
                      href={`https://${project.repository}`} 
                      target="_blank" 
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200 truncate mt-0.5 flex items-center gap-1 cursor-pointer"
                    >
                      <Code id={`repo-icon-${project.id}`} className="h-3 w-3 text-neutral-500 shrink-0" />
                      {project.repository.split('/').pop()}
                    </a>
                  </div>
                </div>

                {/* Progress Tracking */}
                <div id={`project-progress-container-${project.id}`} className="space-y-1.5 pt-1">
                  <div id={`project-progress-flex-${project.id}`} className="flex justify-between text-[10px] font-mono">
                    <span id={`project-progress-lbl-${project.id}`} className="text-neutral-500">Progression</span>
                    <span id={`project-progress-val-${project.id}`} className="text-neutral-300 font-semibold">{project.progress}%</span>
                  </div>
                  <div id={`project-progress-bar-bg-${project.id}`} className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <div 
                      id={`project-progress-bar-fill-${project.id}`}
                      className="h-full bg-linear-to-r from-neutral-500 to-neutral-100 transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card bottom footer */}
              <div id={`project-card-footer-${project.id}`} className="bg-neutral-900/20 px-5 py-3 border-t border-neutral-800/50 flex items-center justify-between">
                {/* Team member avatars overlap */}
                <div id={`project-team-avatars-${project.id}`} className="flex -space-x-1.5 overflow-hidden">
                  {projectMembers.map((member) => (
                    <div 
                      id={`proj-member-${project.id}-${member.id}`}
                      key={member.id} 
                      className="h-5 w-5 rounded-full bg-neutral-900 border border-[#09090b] flex items-center justify-center cursor-help shadow-xs"
                      title={`${member.name} (${member.role})`}
                    >
                      <span id={`proj-member-initials-${project.id}-${member.id}`} className="text-[9px] font-mono font-medium text-neutral-300">{member.avatar}</span>
                    </div>
                  ))}
                  {projectMembers.length === 0 && (
                    <span id={`proj-no-member-${project.id}`} className="text-[10px] font-mono text-neutral-600">Unassigned</span>
                  )}
                </div>

                {/* Task counter status badge */}
                <div id={`project-tasks-badge-container-${project.id}`} className="flex items-center gap-3 text-[10px] font-mono">
                  <span id={`project-issues-count-${project.id}`} className="text-neutral-500 flex items-center gap-1">
                    <AlertCircle id={`issues-icon-${project.id}`} className="h-3 w-3 text-neutral-600" />
                    {stats.open} open
                  </span>
                  <span id={`project-task-completion-${project.id}`} className="text-neutral-400 font-semibold bg-neutral-900 px-1.5 py-0.5 rounded">
                    {stats.completed}/{stats.total} done
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
