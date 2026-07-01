export type ProjectCategory = 'Frontend' | 'Backend' | 'Mobile' | 'DevOps' | 'AI/Data';

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  activeSprint: string;
  category: ProjectCategory;
  repository: string;
  issuesCount: number;
  openIssues: number;
  lastUpdated: string;
  teamIds: string[];
}

export type TaskStatus = 'todo' | 'inprogress' | 'inreview' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: string;
  tags: string[];
}

export type TeamUtilization = 'optimal' | 'overloaded' | 'underutilized';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string; // Initials or color token
  email: string;
  utilization: TeamUtilization;
}

export interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'commit' | 'task' | 'project';
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'delayed';
  progress: number;
}

/** Authenticated application user */
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  avatar: string;
}
