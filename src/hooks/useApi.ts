/**
 * React Query hooks for all API endpoints.
 * Each mutation automatically invalidates affected queries so the UI
 * stays in sync without any manual refreshData() calls.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Project, Task, TeamMember, Activity, Milestone, TaskStatus, TaskPriority, ProjectCategory } from '../types';

// ─── Query keys ──────────────────────────────────────────────────────────────

export const QK = {
  projects:   ['projects']   as const,
  tasks:      ['tasks']      as const,
  team:       ['team']       as const,
  activities: ['activities'] as const,
  milestones: ['milestones'] as const,
};

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useProjects(): UseQueryResult<Project[]> {
  return useQuery({
    queryKey: QK.projects,
    queryFn: () => apiFetch<Project[]>('/api/projects'),
    staleTime: 30_000,
  });
}

export function useTasks(): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: QK.tasks,
    queryFn: () => apiFetch<Task[]>('/api/tasks'),
    staleTime: 20_000,
  });
}

export function useTeam(): UseQueryResult<TeamMember[]> {
  return useQuery({
    queryKey: QK.team,
    queryFn: () => apiFetch<TeamMember[]>('/api/team'),
    staleTime: 60_000,
  });
}

export function useActivities(): UseQueryResult<Activity[]> {
  return useQuery({
    queryKey: QK.activities,
    queryFn: () => apiFetch<Activity[]>('/api/activities'),
    staleTime: 15_000,
  });
}

export function useMilestones(): UseQueryResult<Milestone[]> {
  return useQuery({
    queryKey: QK.milestones,
    queryFn: () => apiFetch<Milestone[]>('/api/milestones'),
    staleTime: 30_000,
  });
}

// ─── Project mutations ────────────────────────────────────────────────────────

interface CreateProjectInput {
  name: string;
  description: string;
  category: ProjectCategory;
  repository: string;
  activeSprint: string;
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      apiFetch<Project>('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: QK.projects });
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.milestones });
      qc.invalidateQueries({ queryKey: QK.activities });
      toast.success(`Project "${project.name}" created`);
    },
    onError: (err: Error) => toast.error(`Failed to create project: ${err.message}`),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      apiFetch<Project>(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onMutate: async ({ id, updates }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: QK.projects });
      const previous = qc.getQueryData<Project[]>(QK.projects);
      qc.setQueryData<Project[]>(QK.projects, old =>
        old?.map(p => p.id === id ? { ...p, ...updates } : p) ?? []
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.projects, ctx.previous);
      toast.error(`Failed to update project: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.projects });
      toast.success('Project updated');
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/projects/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.projects });
      const previous = qc.getQueryData<Project[]>(QK.projects);
      qc.setQueryData<Project[]>(QK.projects, old => old?.filter(p => p.id !== id) ?? []);
      return { previous };
    },
    onError: (err: Error, _id, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.projects, ctx.previous);
      toast.error(`Failed to delete project: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.projects });
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.milestones });
      toast.success('Project deleted');
    },
  });
}

// ─── Task mutations ───────────────────────────────────────────────────────────

interface CreateTaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  projectId: string;
  assigneeId: string;
  dueDate: string;
  tags: string[];
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      apiFetch<Task>('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.projects }); // progress recalculates
      qc.invalidateQueries({ queryKey: QK.activities });
      toast.success('Task created');
    },
    onError: (err: Error) => toast.error(`Failed to create task: ${err.message}`),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ id, status }) => {
      // Optimistic — update the cache immediately so drags feel instant
      await qc.cancelQueries({ queryKey: QK.tasks });
      const previous = qc.getQueryData<Task[]>(QK.tasks);
      qc.setQueryData<Task[]>(QK.tasks, old =>
        old?.map(t => t.id === id ? { ...t, status } : t) ?? []
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.tasks, ctx.previous);
      toast.error(`Status update failed: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.projects });
      qc.invalidateQueries({ queryKey: QK.activities });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries({ queryKey: QK.tasks });
      const previous = qc.getQueryData<Task[]>(QK.tasks);
      qc.setQueryData<Task[]>(QK.tasks, old =>
        old?.map(t => t.id === id ? { ...t, ...updates } : t) ?? []
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.tasks, ctx.previous);
      toast.error(`Failed to update task: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.projects });
      qc.invalidateQueries({ queryKey: QK.activities });
      toast.success('Task updated');
    },
  });
}

export function useReassignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      apiFetch<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      }),
    onMutate: async ({ id, assigneeId }) => {
      await qc.cancelQueries({ queryKey: QK.tasks });
      const previous = qc.getQueryData<Task[]>(QK.tasks);
      qc.setQueryData<Task[]>(QK.tasks, old =>
        old?.map(t => t.id === id ? { ...t, assigneeId } : t) ?? []
      );
      return { previous };
    },
    onError: (err: Error, _vars, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.tasks, ctx.previous);
      toast.error(`Failed to reassign task: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.activities });
      toast.success('Task reassigned');
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QK.tasks });
      const previous = qc.getQueryData<Task[]>(QK.tasks);
      qc.setQueryData<Task[]>(QK.tasks, old => old?.filter(t => t.id !== id) ?? []);
      return { previous };
    },
    onError: (err: Error, _id, ctx: any) => {
      if (ctx?.previous) qc.setQueryData(QK.tasks, ctx.previous);
      toast.error(`Failed to delete task: ${err.message}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.tasks });
      qc.invalidateQueries({ queryKey: QK.projects });
      qc.invalidateQueries({ queryKey: QK.activities });
      toast.success('Task deleted');
    },
  });
}
