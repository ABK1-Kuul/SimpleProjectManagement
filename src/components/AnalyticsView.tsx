import React from 'react';
import { 
  GitCommit, 
  GitPullRequest, 
  FolderGit2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sliders, 
  CornerDownRight,
  TrendingUp,
  Flame,
  Milestone as MilestoneIcon
} from 'lucide-react';
import { Project, Activity, Milestone } from '../types';

interface AnalyticsViewProps {
  projects: Project[];
  activities: Activity[];
  milestones: Milestone[];
}

export default function AnalyticsView({ projects, activities, milestones }: AnalyticsViewProps) {
  
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div id="analytics-view-root" className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090b]">
      
      {/* Visual Analytics Grid */}
      <div id="analytics-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Milestone Status Tracker (Vercel Style) */}
        <div id="milestones-card" className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <div id="milestones-card-header" className="flex items-center justify-between">
            <div>
              <h3 id="milestones-heading" className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
                <MilestoneIcon id="milestone-icon" className="h-4 w-4 text-neutral-400" />
                Cross-Project Milestones
              </h3>
              <p id="milestones-subheading" className="text-[11px] text-neutral-500">Scheduled releases, targets, and live progress indicators.</p>
            </div>
            <span id="milestone-count-badge" className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {milestones.length} Tracked
            </span>
          </div>

          <div id="milestones-list" className="space-y-3.5">
            {milestones.map((milestone) => {
              const projName = getProjectName(milestone.projectId);
              return (
                <div 
                  id={`milestone-item-${milestone.id}`}
                  key={milestone.id} 
                  className="bg-neutral-900/35 border border-neutral-800 p-3 rounded-lg space-y-2.5 hover:border-neutral-700 transition-colors"
                >
                  <div id={`milestone-top-${milestone.id}`} className="flex items-start justify-between">
                    <div id={`milestone-title-group-${milestone.id}`} className="space-y-1">
                      <span id={`milestone-project-${milestone.id}`} className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                        {projName}
                      </span>
                      <h4 id={`milestone-name-${milestone.id}`} className="text-xs font-sans font-medium text-neutral-200">
                        {milestone.name}
                      </h4>
                    </div>

                    <span 
                      id={`milestone-status-${milestone.id}`}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                        milestone.status === 'completed' 
                           ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                           : milestone.status === 'delayed'
                           ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                           : 'bg-neutral-800 text-neutral-400 border border-neutral-750/60'
                      }`}
                    >
                      {milestone.status === 'completed' && <CheckCircle2 id={`milestone-check-${milestone.id}`} className="h-2.5 w-2.5" />}
                      {milestone.status === 'delayed' && <AlertCircle id={`milestone-alert-${milestone.id}`} className="h-2.5 w-2.5" />}
                      {milestone.status === 'pending' && <Clock id={`milestone-clock-${milestone.id}`} className="h-2.5 w-2.5" />}
                      {milestone.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Progressive tracking */}
                  <div id={`milestone-progress-group-${milestone.id}`} className="space-y-1.5">
                    <div id={`milestone-progress-flex-${milestone.id}`} className="flex items-center justify-between text-[10px] font-mono">
                      <span id={`milestone-due-${milestone.id}`} className="text-neutral-500">Target Release: {milestone.dueDate}</span>
                      <span id={`milestone-pct-${milestone.id}`} className="text-neutral-300 font-medium">{milestone.progress}%</span>
                    </div>
                    <div id={`milestone-bar-bg-${milestone.id}`} className="h-1 bg-[#09090b] rounded-full overflow-hidden">
                      <div 
                        id={`milestone-bar-fill-${milestone.id}`}
                        className={`h-full transition-all duration-500 ${
                          milestone.status === 'completed' 
                            ? 'bg-emerald-500' 
                            : milestone.status === 'delayed'
                            ? 'bg-rose-500'
                            : 'bg-neutral-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Health Index matrix */}
        <div id="health-index-card" className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <div id="health-card-header" className="space-y-1">
            <h3 id="health-heading" className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
              <TrendingUp id="health-icon" className="h-4 w-4 text-neutral-400" />
              Project Integration Matrix
            </h3>
            <p id="health-subheading" className="text-[11px] text-neutral-500">Linear comparison of project scopes and sprint health values.</p>
          </div>

          {/* Table list */}
          <div id="health-matrix-table" className="space-y-4 pt-2">
            {projects.map((project) => (
              <div id={`health-item-${project.id}`} key={project.id} className="space-y-2">
                <div id={`health-row-${project.id}`} className="flex items-center justify-between text-xs">
                  <div id={`health-name-group-${project.id}`} className="flex items-center gap-2">
                    <span id={`health-project-badge-${project.id}`} className="h-1.5 w-1.5 rounded-full bg-neutral-500"></span>
                    <span id={`health-project-name-${project.id}`} className="font-sans font-medium text-neutral-300">{project.name}</span>
                  </div>
                  <span id={`health-project-sprint-${project.id}`} className="font-mono text-[10px] text-neutral-500">{project.activeSprint.split(' - ')[0]}</span>
                </div>
                
                {/* Dual metric bar */}
                <div id={`health-bar-container-${project.id}`} className="grid grid-cols-5 gap-2 items-center">
                  <div id={`health-bar-col-track-${project.id}`} className="col-span-4 h-1.5 bg-neutral-900 rounded-sm overflow-hidden flex">
                    {/* Progression segment */}
                    <div 
                      id={`health-progress-segment-${project.id}`}
                      className="bg-neutral-100 h-full border-r border-[#09090b]" 
                      style={{ width: `${project.progress}%` }}
                      title={`Progress: ${project.progress}%`}
                    />
                    {/* Remaining segment */}
                    <div 
                      id={`health-remaining-segment-${project.id}`}
                      className="bg-neutral-900 h-full flex-1" 
                      title="Remaining backlog scope"
                    />
                  </div>
                  <span id={`health-pct-label-${project.id}`} className="text-right text-[10px] font-mono text-neutral-400">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div id="analytics-legend" className="pt-4 border-t border-neutral-800/55 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
            <span id="legend-left" className="flex items-center gap-1">
              <span id="legend-active-dot" className="h-1.5 w-1.5 bg-neutral-100 rounded-full"></span> Completed Scope
            </span>
            <span id="legend-right" className="flex items-center gap-1">
              <span id="legend-backlog-dot" className="h-1.5 w-1.5 bg-neutral-900 rounded-full"></span> Active Backlog
            </span>
          </div>
        </div>
      </div>

      {/* Activity Timeline (Git Log Style) */}
      <div id="timeline-card" className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
        <div id="timeline-card-header" className="flex items-center justify-between">
          <div>
            <h3 id="timeline-heading" className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
              <FolderGit2 id="timeline-icon" className="h-4 w-4 text-neutral-400" />
              Unified Team Activity Log
            </h3>
            <p id="timeline-subheading" className="text-[11px] text-neutral-500">Live stream of git events, merge requests, task movements, and integrations.</p>
          </div>
          <span id="timeline-git-badge" className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
            git branch: main
          </span>
        </div>

        {/* Timeline Log */}
        <div id="timeline-events-container" className="space-y-0 font-mono text-xs">
          {activities.map((act, index) => {
            const isCommit = act.type === 'commit';
            const isProject = act.type === 'project';
            const isTask = act.type === 'task';

            // Generate an arbitrary mock git hash for visual impact (aesthetic parity)
            const mockHash = `c4f${100 + index}e`;

            return (
              <div 
                id={`timeline-event-${act.id}`}
                key={act.id} 
                className="flex items-start gap-4 py-3 hover:bg-neutral-900/30 px-3 rounded-lg transition-colors border-b border-neutral-850 last:border-0"
              >
                {/* Hash */}
                <span id={`timeline-hash-${act.id}`} className="text-neutral-600 text-[11px] select-none shrink-0 font-semibold">{mockHash}</span>

                {/* Git icons */}
                <div id={`timeline-icon-container-${act.id}`} className="flex items-center justify-center pt-0.5 shrink-0">
                  {isCommit && <GitCommit id={`commit-icon-${act.id}`} className="h-3.5 w-3.5 text-neutral-400" />}
                  {isTask && <CornerDownRight id={`task-icon-${act.id}`} className="h-3.5 w-3.5 text-neutral-500" />}
                  {isProject && <GitPullRequest id={`project-icon-${act.id}`} className="h-3.5 w-3.5 text-neutral-500" />}
                </div>

                {/* Event text content */}
                <div id={`timeline-body-${act.id}`} className="flex-1 min-w-0">
                  <div id={`timeline-meta-line-${act.id}`} className="flex items-baseline justify-between gap-4">
                    <p id={`timeline-text-${act.id}`} className="text-neutral-300 font-sans text-xs">
                      <span id={`timeline-author-${act.id}`} className="font-mono text-neutral-400 font-semibold text-[11px] mr-1.5">{act.user}</span>
                      <span id={`timeline-action-${act.id}`} className="text-neutral-500">{act.action}</span>
                      <span id={`timeline-target-${act.id}`} className="font-mono text-neutral-200 ml-1.5 px-1 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[11px]">{act.target}</span>
                    </p>
                    <span id={`timeline-time-${act.id}`} className="text-neutral-650 text-[10px] shrink-0 font-mono">{act.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
