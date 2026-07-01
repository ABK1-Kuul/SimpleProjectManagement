import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import {
  sendError,
  getErrorMessage,
  isSupabaseNetworkError,
  isSupabaseAuthError,
  isSupabaseTableError,
} from './apiErrors';
import {
  createSupabaseClient,
  getSupabaseStatus,
  verifySupabaseConnection,
  type SupabaseStatus,
} from './supabaseConfig';

// Types
import { Project, Task, TeamMember, Activity, Milestone, AuthUser, TaskStatus, TaskPriority, ProjectCategory } from './types';
import {
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ACTIVITIES,
  INITIAL_MILESTONES
} from './mockData';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// ─── Session Middleware ─────────────────────────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET || 'devsync_fallback_secret_change_me';

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7  // 7 days
  }
}));

// Extend express-session types
declare module 'express-session' {
  interface SessionData {
    user: AuthUser;
  }
}

// ─── Supabase Client ────────────────────────────────────────────────────────
const { client: supabase, status: initialSupabaseStatus } = createSupabaseClient();
let supabaseStatus: SupabaseStatus = initialSupabaseStatus;

if (supabaseStatus.mode === 'memory') {
  console.warn(
    'Backend: Using in-memory fallback database.',
    supabaseStatus.issues.length > 0 ? supabaseStatus.issues.join(' ') : ''
  );
}

void (async () => {
  if (!supabase) return;
  const connectionError = await verifySupabaseConnection(supabase);
  supabaseStatus = getSupabaseStatus(supabase, connectionError);
  if (connectionError) {
    console.error('Backend: Supabase connection check failed:', connectionError);
  }
})();

// ─── In-Memory Fallback ─────────────────────────────────────────────────────
let localProjects = [...INITIAL_PROJECTS];
let localTasks = [...INITIAL_TASKS];
let localTeamMembers = [...INITIAL_TEAM_MEMBERS];
let localActivities = [...INITIAL_ACTIVITIES];
let localMilestones = [...INITIAL_MILESTONES];

// Fallback users when Supabase is not configured — passwords are pre-hashed
const FALLBACK_USERS: (AuthUser & { passwordHash: string })[] = [
  {
    id: 'u-1',
    username: 'abdselam',
    displayName: 'Abdselam',
    email: 'abdselam@devsync.app',
    role: 'admin',
    avatar: 'AB',
    passwordHash: '$2b$12$0uA/8PDIctP1gb1C1faMc.LRjPCvF2mJ8L0nnx7M.bAMXJQkCAHk2'
  },
  {
    id: 'u-2',
    username: 'bereket',
    displayName: 'Bereket',
    email: 'bereket@devsync.app',
    role: 'admin',
    avatar: 'BE',
    passwordHash: '$2b$12$O79ERnPnA1KVm20tmekwo.JRwkSwcNA8V2sDYoWG7WmXpODlbun1W'
  }
];

// ─── Mapping Helpers ────────────────────────────────────────────────────────
function mapProjectFromDb(p: any): Project {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    progress: p.progress,
    activeSprint: p.active_sprint,
    category: p.category,
    repository: p.repository,
    issuesCount: p.issues_count,
    openIssues: p.open_issues,
    lastUpdated: p.last_updated,
    teamIds: p.team_ids || []
  };
}

function mapProjectToDb(p: Partial<Project>): any {
  const db: any = {};
  if (p.id !== undefined) db.id = p.id;
  if (p.name !== undefined) db.name = p.name;
  if (p.description !== undefined) db.description = p.description;
  if (p.progress !== undefined) db.progress = p.progress;
  if (p.activeSprint !== undefined) db.active_sprint = p.activeSprint;
  if (p.category !== undefined) db.category = p.category;
  if (p.repository !== undefined) db.repository = p.repository;
  if (p.issuesCount !== undefined) db.issues_count = p.issuesCount;
  if (p.openIssues !== undefined) db.open_issues = p.openIssues;
  if (p.lastUpdated !== undefined) db.last_updated = p.lastUpdated;
  if (p.teamIds !== undefined) db.team_ids = p.teamIds;
  return db;
}

function mapTaskFromDb(t: any): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    status: t.status,
    priority: t.priority,
    projectId: t.project_id,
    assigneeId: t.assignee_id || '',
    dueDate: t.due_date,
    tags: t.tags || []
  };
}

function mapTaskToDb(t: Partial<Task>): any {
  const db: any = {};
  if (t.id !== undefined) db.id = t.id;
  if (t.title !== undefined) db.title = t.title;
  if (t.description !== undefined) db.description = t.description;
  if (t.status !== undefined) db.status = t.status;
  if (t.priority !== undefined) db.priority = t.priority;
  if (t.projectId !== undefined) db.project_id = t.projectId;
  if (t.assigneeId !== undefined) db.assignee_id = t.assigneeId || null;
  if (t.dueDate !== undefined) db.due_date = t.dueDate;
  if (t.tags !== undefined) db.tags = t.tags;
  return db;
}

function mapTeamMemberFromDb(m: any): TeamMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    avatar: m.avatar,
    email: m.email,
    utilization: m.utilization
  };
}

function mapActivityFromDb(a: any): Activity {
  return {
    id: a.id,
    user: a.user_name,
    avatar: a.avatar,
    action: a.action,
    target: a.target,
    timestamp: a.timestamp,
    type: a.type
  };
}

function mapActivityToDb(a: Partial<Activity>): any {
  const db: any = {};
  if (a.id !== undefined) db.id = a.id;
  if (a.user !== undefined) db.user_name = a.user;
  if (a.avatar !== undefined) db.avatar = a.avatar;
  if (a.action !== undefined) db.action = a.action;
  if (a.target !== undefined) db.target = a.target;
  if (a.timestamp !== undefined) db.timestamp = a.timestamp;
  if (a.type !== undefined) db.type = a.type;
  return db;
}

function mapMilestoneFromDb(m: any): Milestone {
  return {
    id: m.id,
    projectId: m.project_id,
    name: m.name,
    dueDate: m.due_date,
    status: m.status,
    progress: m.progress
  };
}

function mapMilestoneToDb(m: Partial<Milestone>): any {
  const db: any = {};
  if (m.id !== undefined) db.id = m.id;
  if (m.projectId !== undefined) db.project_id = m.projectId;
  if (m.name !== undefined) db.name = m.name;
  if (m.dueDate !== undefined) db.due_date = m.dueDate;
  if (m.status !== undefined) db.status = m.status;
  if (m.progress !== undefined) db.progress = m.progress;
  return db;
}

function mapUserFromDb(u: any): AuthUser {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    role: u.role,
    avatar: u.avatar
  };
}

// ─── Auth Middleware ────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

// ─── Progress Recalculation ─────────────────────────────────────────────────
async function recalculateProjectProgress(projectId: string) {
  if (supabase) {
    const { data: dbTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (error || !dbTasks) return;

    const totalCount = dbTasks.length;
    const completedCount = dbTasks.filter(t => t.status === 'done').length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    await supabase
      .from('projects')
      .update({ progress, last_updated: 'Just now' })
      .eq('id', projectId);

    const { data: dbMilestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId);

    if (dbMilestones) {
      for (const m of dbMilestones) {
        await supabase
          .from('milestones')
          .update({
            progress,
            status: progress === 100 ? 'completed' : m.status
          })
          .eq('id', m.id);
      }
    }
  } else {
    const projectTasks = localTasks.filter(t => t.projectId === projectId);
    const totalCount = projectTasks.length;
    const completedCount = projectTasks.filter(t => t.status === 'done').length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    localProjects = localProjects.map(p =>
      p.id === projectId ? { ...p, progress, lastUpdated: 'Just now' } : p
    );

    localMilestones = localMilestones.map(m =>
      m.projectId === projectId ? { ...m, progress, status: progress === 100 ? 'completed' : m.status } : m
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH / DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: supabaseStatus.connected || supabaseStatus.mode === 'memory',
    auth: {
      mode: supabaseStatus.mode,
      supabaseConfigured: supabaseStatus.configured,
      supabaseConnected: supabaseStatus.connected,
      keyType: supabaseStatus.keyType,
      keySource: supabaseStatus.keySource,
      issues: supabaseStatus.issues,
      lastError: supabaseStatus.lastError,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS (public – no requireAuth)
// ═══════════════════════════════════════════════════════════════════════════

function findFallbackUser(username: string) {
  return FALLBACK_USERS.find(u => u.username === username.toLowerCase().trim()) ?? null;
}

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, {
        error: 'Username and password are required.',
        code: 'VALIDATION_ERROR',
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    let userRecord: (AuthUser & { passwordHash: string }) | null = null;
    let usedFallbackAuth = false;

    if (supabase) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', normalizedUsername)
        .maybeSingle();

      if (error) {
        supabaseStatus = getSupabaseStatus(supabase, error.message);

        if (isSupabaseAuthError(error.message, error.code)) {
          return sendError(res, 503, {
            error: 'Supabase rejected the server API key.',
            code: 'SUPABASE_CONFIG_ERROR',
            hint: 'Set SUPABASE_SERVICE_ROLE_KEY in Vercel. Do not use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for server auth.',
            details: error.message,
          });
        }

        if (isSupabaseNetworkError(error.message)) {
          return sendError(res, 503, {
            error: 'Could not connect to Supabase.',
            code: 'SUPABASE_CONNECTION_ERROR',
            hint: 'Verify SUPABASE_URL is correct and your Supabase project is running.',
            details: error.message,
          });
        }

        if (isSupabaseTableError(error.message, error.code)) {
          const found = findFallbackUser(normalizedUsername);
          if (!found) {
            return sendError(res, 401, {
              error: 'Invalid username or password.',
              code: 'AUTH_FAILED',
              hint: 'The app_users table is missing in Supabase. Run supabase_schema.sql or use abdselam / bereket with in-memory auth.',
            });
          }
          userRecord = found;
          usedFallbackAuth = true;
        } else {
          return sendError(res, 503, {
            error: 'Supabase query failed during login.',
            code: 'SUPABASE_QUERY_ERROR',
            hint: 'Check Vercel function logs and confirm the app_users table exists.',
            details: error.message,
          });
        }
      } else if (!data) {
        return sendError(res, 401, {
          error: 'Invalid username or password.',
          code: 'AUTH_FAILED',
        });
      } else {
        userRecord = {
          ...mapUserFromDb(data),
          passwordHash: data.password_hash
        };
      }
    } else {
      const found = findFallbackUser(normalizedUsername);
      if (!found) {
        return sendError(res, 401, {
          error: 'Invalid username or password.',
          code: 'AUTH_FAILED',
          hint: supabaseStatus.issues.length > 0 ? supabaseStatus.issues[0] : undefined,
        });
      }
      userRecord = found;
      usedFallbackAuth = true;
    }

    if (!userRecord?.passwordHash) {
      return sendError(res, 500, {
        error: 'User record is missing a password hash.',
        code: 'INTERNAL_ERROR',
        hint: usedFallbackAuth
          ? 'In-memory auth is active. Try abdselam or bereket.'
          : 'Check the app_users.password_hash column in Supabase.',
      });
    }

    const isValid = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isValid) {
      return sendError(res, 401, {
        error: 'Invalid username or password.',
        code: 'AUTH_FAILED',
      });
    }

    const safeUser: AuthUser = {
      id: userRecord.id,
      username: userRecord.username,
      displayName: userRecord.displayName,
      email: userRecord.email,
      role: userRecord.role,
      avatar: userRecord.avatar
    };

    if (!req.session) {
      return sendError(res, 500, {
        error: 'Session is unavailable on the server.',
        code: 'SESSION_ERROR',
        hint: 'Set SESSION_SECRET in Vercel environment variables and redeploy.',
      });
    }

    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return sendError(res, 500, {
          error: 'Login succeeded but the session could not be saved.',
          code: 'SESSION_ERROR',
          hint: process.env.VERCEL
            ? 'Vercel serverless uses in-memory sessions that may not persist between requests.'
            : 'Check SESSION_SECRET and server logs.',
          details: getErrorMessage(err),
        });
      }
      return res.json({
        user: safeUser,
        authMode: usedFallbackAuth || supabaseStatus.mode === 'memory' ? 'memory' : 'supabase',
      });
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return sendError(res, 500, {
      error: 'Unexpected server error during login.',
      code: 'INTERNAL_ERROR',
      details: getErrorMessage(err),
    });
  }
});

// GET /api/auth/me – returns current session user
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    if (req.session?.user) {
      return res.json({ user: req.session.user });
    }
    return sendError(res, 401, {
      error: 'Not authenticated.',
      code: 'UNAUTHORIZED',
    });
  } catch (err: unknown) {
    console.error('/api/auth/me error:', err);
    return sendError(res, 500, {
      error: 'Failed to read the current session.',
      code: 'SESSION_ERROR',
      hint: 'Set SESSION_SECRET in Vercel and redeploy.',
      details: getErrorMessage(err),
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  if (!req.session) {
    return res.json({ message: 'Logged out successfully.' });
  }

  req.session.destroy((err) => {
    if (err) {
      return sendError(res, 500, {
        error: 'Failed to destroy session.',
        code: 'SESSION_ERROR',
        details: getErrorMessage(err),
      });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROTECTED API ROUTES (all require active session)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Team Members API
app.get('/api/team', requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('team_members').select('*');
      if (error) throw error;
      res.json(data.map(mapTeamMemberFromDb));
    } else {
      res.json(localTeamMembers);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Projects API
app.get('/api/projects', requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      res.json(data.map(mapProjectFromDb));
    } else {
      res.json(localProjects);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { name, description, category, repository, activeSprint } = req.body;
    const newId = `p-${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name,
      description: description || '',
      progress: 0,
      activeSprint,
      category,
      repository,
      issuesCount: 2,
      openIssues: 2,
      lastUpdated: 'Just now',
      teamIds: ['1', '2']
    };

    const defaultTasks: Task[] = [
      {
        id: `t-${Date.now()}-1`,
        title: `Draft system design specifications`,
        description: `Map microservices schema, state matrices, and security tokens for ${name}.`,
        status: 'todo',
        priority: 'high',
        projectId: newId,
        assigneeId: '1',
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['architecture', 'planning']
      },
      {
        id: `t-${Date.now()}-2`,
        title: `Configure base pipeline scaffolding`,
        description: `Bootstrap project structure, ESLint validation, Tailwind configuration, and docker config.`,
        status: 'todo',
        priority: 'medium',
        projectId: newId,
        assigneeId: '2',
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tags: ['setup', 'ci-cd']
      }
    ];

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      projectId: newId,
      name: `Release V1 Core Interface`,
      dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      progress: 0
    };

    const sessionUser = req.session.user!;
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      user: sessionUser.displayName,
      avatar: sessionUser.avatar,
      action: 'initialized repository context',
      target: repository,
      timestamp: 'Just now',
      type: 'project'
    };

    if (supabase) {
      const { error: pErr } = await supabase.from('projects').insert(mapProjectToDb(newProject));
      if (pErr) throw pErr;

      const { error: tErr } = await supabase.from('tasks').insert(defaultTasks.map(mapTaskToDb));
      if (tErr) throw tErr;

      const { error: mErr } = await supabase.from('milestones').insert(mapMilestoneToDb(newMilestone));
      if (mErr) throw mErr;

      const { error: aErr } = await supabase.from('activities').insert(mapActivityToDb(newActivity));
      if (aErr) throw aErr;

      res.status(201).json(newProject);
    } else {
      localProjects = [newProject, ...localProjects];
      localTasks = [...localTasks, ...defaultTasks];
      localMilestones = [...localMilestones, newMilestone];
      localActivities = [newActivity, ...localActivities];
      res.status(201).json(newProject);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Tasks API
app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('tasks').select('*');
      if (error) throw error;
      res.json(data.map(mapTaskFromDb));
    } else {
      res.json(localTasks);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, priority, projectId, assigneeId, dueDate, tags } = req.body;
    const newId = `t-${Date.now()}`;
    const newTask: Task = {
      id: newId,
      title,
      description: description || '',
      status: 'todo',
      priority,
      projectId,
      assigneeId: assigneeId || '',
      dueDate,
      tags: tags || []
    };

    let memberName = 'Someone';
    let memberAvatar = '??';
    let projectName = 'Unknown';

    if (supabase) {
      const { data: member } = await supabase.from('team_members').select('*').eq('id', assigneeId || '').single();
      if (member) {
        memberName = member.name;
        memberAvatar = member.avatar;
      }
      const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (project) {
        projectName = project.name;
      }

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: memberName,
        avatar: memberAvatar,
        action: `received assignment for "${title.substring(0, 20)}..." in`,
        target: projectName,
        timestamp: 'Just now',
        type: 'task'
      };

      const { error: tErr } = await supabase.from('tasks').insert(mapTaskToDb(newTask));
      if (tErr) throw tErr;

      const { error: aErr } = await supabase.from('activities').insert(mapActivityToDb(newActivity));
      if (aErr) throw aErr;

      const { data: allProjTasks } = await supabase.from('tasks').select('*').eq('project_id', projectId);
      if (allProjTasks) {
        const total = allProjTasks.length;
        const open = allProjTasks.filter(t => t.status !== 'done').length;
        await supabase.from('projects').update({
          issues_count: total,
          open_issues: open
        }).eq('id', projectId);
      }

      await recalculateProjectProgress(projectId);
      res.status(201).json(newTask);
    } else {
      const member = localTeamMembers.find(m => m.id === assigneeId) || { name: 'Someone', avatar: '??' };
      const project = localProjects.find(p => p.id === projectId) || { name: 'Unknown' };
      memberName = member.name;
      memberAvatar = member.avatar;
      projectName = project.name;

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        user: memberName,
        avatar: memberAvatar,
        action: `received assignment for "${title.substring(0, 20)}..." in`,
        target: projectName,
        timestamp: 'Just now',
        type: 'task'
      };

      localTasks = [newTask, ...localTasks];
      localActivities = [newActivity, ...localActivities];

      localProjects = localProjects.map(p => {
        if (p.id === projectId) {
          const allProjTasks = localTasks.filter(t => t.projectId === projectId);
          return {
            ...p,
            issuesCount: allProjTasks.length,
            openIssues: allProjTasks.filter(t => t.status !== 'done').length
          };
        }
        return p;
      });

      await recalculateProjectProgress(projectId);
      res.status(201).json(newTask);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigneeId } = req.body;

    let updatedTask: Task | null = null;
    let oldTask: Task | null = null;

    if (supabase) {
      const { data: dbTask, error: fErr } = await supabase.from('tasks').select('*').eq('id', id).single();
      if (fErr || !dbTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      oldTask = mapTaskFromDb(dbTask);

      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (assigneeId !== undefined) updates.assignee_id = assigneeId || null;

      const { data: finalDbTask, error: uErr } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      if (uErr || !finalDbTask) throw uErr;

      updatedTask = mapTaskFromDb(finalDbTask);

      if (status !== undefined && oldTask.status !== status) {
        const { data: member } = await supabase.from('team_members').select('*').eq('id', updatedTask.assigneeId).single();
        const memberName = member?.name || 'Someone';
        const memberAvatar = member?.avatar || '??';

        const newAct: Activity = {
          id: `act-${Date.now()}`,
          user: memberName,
          avatar: memberAvatar,
          action: `shifted status of "${updatedTask.title.substring(0, 24)}..." to`,
          target: status.toUpperCase(),
          timestamp: 'Just now',
          type: 'task'
        };
        await supabase.from('activities').insert(mapActivityToDb(newAct));
      }

      if (assigneeId !== undefined && oldTask.assigneeId !== assigneeId) {
        const { data: member } = await supabase.from('team_members').select('*').eq('id', assigneeId).single();
        const memberName = member?.name || 'Someone';
        const memberAvatar = member?.avatar || '??';

        const newAct: Activity = {
          id: `act-${Date.now()}`,
          user: memberName,
          avatar: memberAvatar,
          action: `accepted deployment dispatch for`,
          target: updatedTask.title.substring(0, 24) + '...',
          timestamp: 'Just now',
          type: 'task'
        };
        await supabase.from('activities').insert(mapActivityToDb(newAct));
      }

      const { data: allProjTasks } = await supabase.from('tasks').select('*').eq('project_id', updatedTask.projectId);
      if (allProjTasks) {
        const open = allProjTasks.filter(t => t.status !== 'done').length;
        await supabase.from('projects').update({
          open_issues: open
        }).eq('id', updatedTask.projectId);
      }

      await recalculateProjectProgress(updatedTask.projectId);
      res.json(updatedTask);
    } else {
      const idx = localTasks.findIndex(t => t.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: 'Task not found' });
      }
      oldTask = localTasks[idx];

      const localUpdated = { ...oldTask };
      if (status !== undefined) localUpdated.status = status;
      if (assigneeId !== undefined) localUpdated.assigneeId = assigneeId;

      localTasks[idx] = localUpdated;
      updatedTask = localUpdated;

      if (status !== undefined && oldTask.status !== status) {
        const member = localTeamMembers.find(m => m.id === updatedTask!.assigneeId) || { name: 'Someone', avatar: '??' };
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          user: member.name,
          avatar: member.avatar,
          action: `shifted status of "${updatedTask!.title.substring(0, 24)}..." to`,
          target: status.toUpperCase(),
          timestamp: 'Just now',
          type: 'task'
        };
        localActivities = [newAct, ...localActivities];
      }

      if (assigneeId !== undefined && oldTask.assigneeId !== assigneeId) {
        const member = localTeamMembers.find(m => m.id === assigneeId) || { name: 'Someone', avatar: '??' };
        const newAct: Activity = {
          id: `act-${Date.now()}`,
          user: member.name,
          avatar: member.avatar,
          action: `accepted deployment dispatch for`,
          target: updatedTask!.title.substring(0, 24) + '...',
          timestamp: 'Just now',
          type: 'task'
        };
        localActivities = [newAct, ...localActivities];
      }

      localProjects = localProjects.map(p => {
        if (p.id === updatedTask!.projectId) {
          const allProjTasks = localTasks.filter(t => t.projectId === updatedTask!.projectId);
          return {
            ...p,
            openIssues: allProjTasks.filter(t => t.status !== 'done').length
          };
        }
        return p;
      });

      await recalculateProjectProgress(updatedTask.projectId);
      res.json(updatedTask);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Activities API
app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      res.json(data.map(mapActivityFromDb));
    } else {
      res.json(localActivities);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', requireAuth, async (req, res) => {
  try {
    const { user, avatar, action, target, type } = req.body;
    const newId = `act-sim-${Date.now()}`;
    const newAct: Activity = {
      id: newId,
      user,
      avatar,
      action,
      target,
      timestamp: 'Just now',
      type
    };

    if (supabase) {
      const { error } = await supabase.from('activities').insert(mapActivityToDb(newAct));
      if (error) throw error;
      res.status(201).json(newAct);
    } else {
      localActivities = [newAct, ...localActivities];
      res.status(201).json(newAct);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Milestones API
app.get('/api/milestones', requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('milestones').select('*');
      if (error) throw error;
      res.json(data.map(mapMilestoneFromDb));
    } else {
      res.json(localMilestones);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Vite Dev Server / Static Serving ──────────────────────────────────────
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = parseInt(process.env.PORT || '3000', 10);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('Backend: Vite dev server mounted in middleware mode.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`Backend: Serving static assets in production from: ${distPath}`);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend: Server is running on http://localhost:${port}`);
  });
}

// Return structured JSON for unhandled API errors.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (!req.path.startsWith('/api')) {
    return next(err);
  }

  console.error('Unhandled API error:', err);
  if (res.headersSent) {
    return next(err);
  }

  return sendError(res, 500, {
    error: 'Unexpected server error.',
    code: 'INTERNAL_ERROR',
    details: getErrorMessage(err),
  });
});

export default app;

// Vercel runs the Express app via api/[[...path]].ts; only start a standalone server locally.
if (!process.env.VERCEL) {
  startServer();
}
