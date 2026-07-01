import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Smile, 
  Mail, 
  Sparkles, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  FolderMinus,
  CheckCircle,
  FolderLock
} from 'lucide-react';
import { TeamMember, Task, Project } from '../types';

interface TeamViewProps {
  teamMembers: TeamMember[];
  tasks: Task[];
  projects: Project[];
  onReassignTask: (taskId: string, newAssigneeId: string) => void;
}

export default function TeamView({ teamMembers, tasks, projects, onReassignTask }: TeamViewProps) {
  
  // Get active tasks (non-done) assigned to a team member
  const getActiveTasksForMember = (memberId: string) => {
    return tasks.filter((t) => t.assigneeId === memberId && t.status !== 'done');
  };

  // Get completed tasks assigned to a team member
  const getCompletedTasksForMember = (memberId: string) => {
    return tasks.filter((t) => t.assigneeId === memberId && t.status === 'done');
  };

  // Calculate dynamic utilization based on active tasks
  const getDynamicUtilization = (activeCount: number) => {
    if (activeCount === 0 || activeCount === 1) return { label: 'UNDERUTILIZED', style: 'bg-neutral-900 text-neutral-400 border border-neutral-800' };
    if (activeCount <= 3) return { label: 'OPTIMAL', style: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' };
    return { label: 'OVERLOADED', style: 'bg-rose-950/40 text-rose-400 border border-rose-900/40' };
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  return (
    <div id="team-view-root" className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090b]">
      
      {/* View Header */}
      <div id="team-section-header" className="space-y-1 select-none">
        <h2 id="team-heading" className="text-sm font-sans font-semibold text-neutral-100 tracking-tight">Team Coordination & Resource Hub</h2>
        <p id="team-subheading" className="text-xs text-neutral-500">Live developer workloads, status monitoring, and resource optimization based on active board weight.</p>
      </div>

      {/* Grid of Team Members */}
      <div id="team-grid" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {teamMembers.map((member) => {
          const activeTasks = getActiveTasksForMember(member.id);
          const completedTasks = getCompletedTasksForMember(member.id);
          const utilization = getDynamicUtilization(activeTasks.length);

          return (
            <div 
              id={`team-card-${member.id}`}
              key={member.id} 
              className="bg-[#09090b] border border-neutral-800 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-neutral-700 transition-colors"
            >
              {/* Card top */}
              <div id={`team-card-top-${member.id}`} className="p-5 space-y-5">
                
                {/* Profile row */}
                <div id={`team-card-profile-${member.id}`} className="flex items-start justify-between">
                  <div id={`team-profile-info-${member.id}`} className="flex items-center gap-3">
                    {/* User large avatar with gradient */}
                    <div id={`team-avatar-${member.id}`} className="h-10 w-10 rounded-lg bg-linear-to-b from-neutral-800 to-neutral-950 border border-neutral-800 flex items-center justify-center">
                      <span id={`team-avatar-initials-${member.id}`} className="font-mono text-sm font-semibold text-neutral-100">{member.avatar}</span>
                    </div>

                    <div id={`team-profile-text-${member.id}`}>
                      <h3 id={`team-member-name-${member.id}`} className="text-xs font-sans font-semibold text-neutral-100 group-hover:text-white transition-colors">{member.name}</h3>
                      <p id={`team-member-role-${member.id}`} className="text-[11px] font-mono text-neutral-500 mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {/* Utilization Badge */}
                  <span 
                    id={`team-util-badge-${member.id}`}
                    className={`text-[9px] font-mono font-medium px-2.5 py-0.5 rounded ${utilization.style}`}
                  >
                    {utilization.label}
                  </span>
                </div>

                {/* Micro metrics strip */}
                <div id={`team-metrics-strip-${member.id}`} className="grid grid-cols-3 gap-3">
                  <div id={`team-metric-active-${member.id}`} className="bg-neutral-900/30 border border-neutral-800/80 rounded p-2 text-center">
                    <span id={`team-metric-lbl-active-${member.id}`} className="block text-[8px] font-mono text-neutral-500 uppercase">Active Weight</span>
                    <span id={`team-metric-val-active-${member.id}`} className="text-xs font-mono font-medium text-neutral-200 mt-1 block">
                      {activeTasks.length} tasks
                    </span>
                  </div>

                  <div id={`team-metric-completed-${member.id}`} className="bg-neutral-900/30 border border-neutral-800/80 rounded p-2 text-center">
                    <span id={`team-metric-lbl-completed-${member.id}`} className="block text-[8px] font-mono text-neutral-500 uppercase">Velocity</span>
                    <span id={`team-metric-val-completed-${member.id}`} className="text-xs font-mono font-medium text-emerald-500 mt-1 block">
                      {completedTasks.length} done
                    </span>
                  </div>

                  <div id={`team-metric-email-${member.id}`} className="bg-neutral-900/30 border border-neutral-800/80 rounded p-2 text-center overflow-hidden">
                    <span id={`team-metric-lbl-email-${member.id}`} className="block text-[8px] font-mono text-neutral-500 uppercase">Email Contact</span>
                    <span id={`team-metric-val-email-${member.id}`} className="text-[10px] font-mono text-neutral-400 truncate mt-1 block hover:text-neutral-200 cursor-help" title={member.email}>
                      {member.email.split('@')[0]}
                    </span>
                  </div>
                </div>

                {/* List of current Active tasks */}
                <div id={`team-tasks-section-${member.id}`} className="space-y-2">
                  <p id={`team-tasks-label-${member.id}`} className="text-[9px] font-mono font-semibold text-neutral-500 uppercase tracking-wider">Assigned Task Stack ({activeTasks.length})</p>
                  
                  {activeTasks.length === 0 ? (
                    <div id={`team-tasks-empty-${member.id}`} className="py-6 border border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center">
                      <span id={`team-empty-status-${member.id}`} className="text-[10px] font-mono text-neutral-600 uppercase">Available for dispatch</span>
                    </div>
                  ) : (
                    <div id={`team-tasks-list-${member.id}`} className="space-y-2">
                      {activeTasks.map((task) => (
                        <div 
                          id={`team-task-row-${member.id}-${task.id}`}
                          key={task.id} 
                          className="bg-neutral-900/40 border border-neutral-800 rounded px-3 py-2 flex items-center justify-between text-xs hover:border-neutral-750 transition-colors"
                        >
                          <div id={`team-task-info-${member.id}-${task.id}`} className="min-w-0 pr-3 space-y-0.5">
                            <h4 id={`team-task-title-${member.id}-${task.id}`} className="font-sans font-medium text-neutral-300 truncate">{task.title}</h4>
                            <span id={`team-task-project-${member.id}-${task.id}`} className="text-[9px] font-mono text-neutral-500 block truncate uppercase">
                              {getProjectName(task.projectId)}
                            </span>
                          </div>

                          <div id={`team-task-actions-${member.id}-${task.id}`} className="flex items-center gap-2 shrink-0">
                            {/* Reassign dropdown */}
                            <select
                              id={`reassign-select-${member.id}-${task.id}`}
                              value={task.assigneeId}
                              onChange={(e) => onReassignTask(task.id, e.target.value)}
                              className="bg-neutral-900 border border-neutral-800 text-[10px] font-sans text-neutral-400 py-0.5 px-1.5 rounded cursor-pointer hover:border-neutral-700 transition-colors"
                              title="Reassign Task"
                            >
                              {teamMembers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  To: {m.avatar}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
