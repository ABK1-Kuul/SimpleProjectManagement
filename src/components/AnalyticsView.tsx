import React, { useState } from 'react';
import {
  GitCommit, GitPullRequest, FolderGit2, CheckCircle2,
  AlertCircle, Clock, CornerDownRight, TrendingUp,
  Milestone as MilestoneIcon, Filter, X,
} from 'lucide-react';
import { Project, Activity, Milestone } from '../types';

interface AnalyticsViewProps {
  projects: Project[];
  activities: Activity[];
  milestones: Milestone[];
}

export default function AnalyticsView({ projects, activities, milestones }: AnalyticsViewProps) {
  const [activityProjectFilter, setActivityProjectFilter] = useState('all');
  const [activityTypeFilter,    setActivityTypeFilter]    = useState('all');

  const getProjectName = (projectId: string) =>
    projects.find(p => p.id === projectId)?.name ?? 'Unknown Project';

  // ── Filtered activities ────────────────────────────────────────────────────
  const filteredActivities = activities.filter(act => {
    const matchType    = activityTypeFilter === 'all' || act.type === activityTypeFilter;
    const matchProject = activityProjectFilter === 'all' || act.target.toLowerCase().includes(
      (projects.find(p => p.id === activityProjectFilter)?.name ?? '').toLowerCase()
    );
    return matchType && matchProject;
  });

  const hasFilters = activityProjectFilter !== 'all' || activityTypeFilter !== 'all';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090b]">

      {/* ── Top grid: Milestones + Health ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Milestones */}
        <div className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
                <MilestoneIcon className="h-4 w-4 text-neutral-400" />
                Cross-Project Milestones
              </h3>
              <p className="text-[11px] text-neutral-500">Scheduled releases, targets, and live progress.</p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
              {milestones.length} Tracked
            </span>
          </div>

          <div className="space-y-3.5">
            {milestones.map(milestone => (
              <div key={milestone.id} className="bg-neutral-900/35 border border-neutral-800 p-3 rounded-lg space-y-2.5 hover:border-neutral-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                      {getProjectName(milestone.projectId)}
                    </span>
                    <h4 className="text-xs font-sans font-medium text-neutral-200">{milestone.name}</h4>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                    milestone.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' :
                    milestone.status === 'delayed'   ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40' :
                                                       'bg-neutral-800 text-neutral-400 border border-neutral-700/60'
                  }`}>
                    {milestone.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                    {milestone.status === 'delayed'   && <AlertCircle  className="h-2.5 w-2.5" />}
                    {milestone.status === 'pending'   && <Clock        className="h-2.5 w-2.5" />}
                    {milestone.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-neutral-500">Target: {milestone.dueDate}</span>
                    <span className="text-neutral-300 font-medium">{milestone.progress}%</span>
                  </div>
                  <div className="h-1 bg-[#09090b] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        milestone.status === 'completed' ? 'bg-emerald-500' :
                        milestone.status === 'delayed'   ? 'bg-rose-500'    : 'bg-neutral-400'
                      }`}
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <div className="py-8 border border-dashed border-neutral-800 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-mono text-neutral-600 uppercase">No milestones yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Health Matrix */}
        <div className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              Project Integration Matrix
            </h3>
            <p className="text-[11px] text-neutral-500">Linear comparison of project scope and sprint health.</p>
          </div>

          <div className="space-y-4 pt-2">
            {projects.map(project => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                    <span className="font-sans font-medium text-neutral-300">{project.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-500">{project.activeSprint.split(' - ')[0]}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div className="col-span-4 h-1.5 bg-neutral-900 rounded-sm overflow-hidden flex">
                    <div
                      className="bg-neutral-100 h-full border-r border-[#09090b] transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                      title={`Progress: ${project.progress}%`}
                    />
                    <div className="bg-neutral-900 h-full flex-1" title="Remaining scope" />
                  </div>
                  <span className="text-right text-[10px] font-mono text-neutral-400">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-800/55 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-neutral-100 rounded-full" /> Completed</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 bg-neutral-900 border border-neutral-700 rounded-full" /> Remaining</span>
          </div>
        </div>
      </div>

      {/* ── Activity Timeline ──────────────────────────────────────────────── */}
      <div className="bg-[#09090b] border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xs font-sans font-semibold text-neutral-100 flex items-center gap-1.5">
              <FolderGit2 className="h-4 w-4 text-neutral-400" />
              Unified Team Activity Log
            </h3>
            <p className="text-[11px] text-neutral-500">Live stream of task movements, project events, and integrations.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-neutral-600" />
              <select
                value={activityTypeFilter}
                onChange={e => setActivityTypeFilter(e.target.value)}
                aria-label="Filter by type"
                className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono text-neutral-400 focus:outline-none focus:border-neutral-600"
              >
                <option value="all">All types</option>
                <option value="task">Tasks</option>
                <option value="project">Projects</option>
                <option value="commit">Commits</option>
              </select>
            </div>

            {hasFilters && (
              <button
                onClick={() => { setActivityProjectFilter('all'); setActivityTypeFilter('all'); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded transition-colors"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}

            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
              {filteredActivities.length} events
            </span>
          </div>
        </div>

        {/* Log */}
        <div className="space-y-0 font-mono text-xs">
          {filteredActivities.length === 0 ? (
            <div className="py-10 border border-dashed border-neutral-800 rounded-lg flex items-center justify-center">
              <span className="text-[10px] font-mono text-neutral-600 uppercase">No activity matches filters</span>
            </div>
          ) : (
            filteredActivities.map((act, i) => {
              const hash = `c4f${100 + i}e`;
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-4 py-3 hover:bg-neutral-900/30 px-3 rounded-lg transition-colors border-b border-neutral-800/40 last:border-0"
                >
                  <span className="text-neutral-700 text-[11px] select-none shrink-0 font-semibold">{hash}</span>
                  <div className="flex items-center justify-center pt-0.5 shrink-0">
                    {act.type === 'commit'  && <GitCommit      className="h-3.5 w-3.5 text-neutral-400" />}
                    {act.type === 'task'    && <CornerDownRight className="h-3.5 w-3.5 text-neutral-500" />}
                    {act.type === 'project' && <GitPullRequest  className="h-3.5 w-3.5 text-neutral-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-neutral-300 font-sans text-xs">
                        <span className="font-mono text-neutral-400 font-semibold text-[11px] mr-1.5">{act.user}</span>
                        <span className="text-neutral-500">{act.action}</span>
                        <span className="font-mono text-neutral-200 ml-1.5 px-1 py-0.5 bg-neutral-900 border border-neutral-800 rounded text-[11px]">{act.target}</span>
                      </p>
                      <span className="text-neutral-600 text-[10px] shrink-0">{act.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
