import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import session from 'express-session';
import bcrypt from 'bcryptjs';

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
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

const isSupabaseConfigured = supabaseUrl && supabaseKey &&
                             !supabaseUrl.includes('your-project-id') &&
                             !supabaseKey.includes('your-supabase-service-role-key') &&
                             supabaseUrl !== 'MY_SUPABASE_URL' &&
                             supabaseKey !== 'MY_SUPABASE_KEY';

const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null;

if (isSupabaseConfigured) {
  console.log('Backend: Supabase client initialized successfully.');
} else {
  console.warn('Backend: Supabase credentials not set or invalid in env. Using in-memory fallback database.');
}

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
    passwordHash: bcrypt.hashSync('DevSync@Abs2024!', 12)
  },
  {
    id: 'u-2',
    username: 'bereket',
    displayName: 'Bereket',
    email: 'bereket@devsync.app',
    role: 'admin',
    avatar: 'BE',
    passwordHash: bcrypt.hashSync('DevSync@Ber2024!', 12)
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
// AUTH ENDPOINTS (public – no requireAuth)
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    let userRecord: (AuthUser & { passwordHash: string }) | null = null;

    if (supabase) {
      // Fetch user from Supabase
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username.toLowerCase().trim())
        .single();

      if (error) {
        // Table may not exist yet — fall back to in-memory users
        const found = FALLBACK_USERS.find(u => u.username === username.toLowerCase().trim());
        if (!found) {
          return res.status(401).json({ error: 'Invalid username or password.' });
        }
        userRecord = found;
      } else if (!data) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      } else {
        userRecord = {
          ...mapUserFromDb(data),
          passwordHash: data.password_hash
        };
      }
    } else {
      // Fallback: use in-memory users
      const found = FALLBACK_USERS.find(u => u.username === username.toLowerCase().trim());
      if (!found) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }
      userRecord = found;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Build safe user object (no hash)
    const safeUser: AuthUser = {
      id: userRecord.id,
      username: userRecord.username,
      displayName: userRecord.displayName,
      email: userRecord.email,
      role: userRecord.role,
      avatar: userRecord.avatar
    };

    // Store in session
    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Failed to create session.' });
      }
      return res.json({ user: safeUser });
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me – returns current session user
app.get('/api/auth/me', (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ error: 'Not authenticated.' });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session.' });
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

export default app;

// Vercel runs the Express app via api/index.ts; only start a standalone server locally.
if (!process.env.VERCEL) {
  startServer();
}
