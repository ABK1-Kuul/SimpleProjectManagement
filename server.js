// src/server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import bcrypt from "bcryptjs";

// src/mockData.ts
var INITIAL_TEAM_MEMBERS = [
  {
    id: "1",
    name: "Abdselam Al-Aswadi",
    role: "Tech Lead / Senior Backend",
    avatar: "AA",
    email: "abdselam@acme.dev",
    utilization: "optimal"
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    role: "Staff Frontend Architect",
    avatar: "SJ",
    email: "sarah.j@acme.dev",
    utilization: "overloaded"
  },
  {
    id: "3",
    name: "Chen Wei",
    role: "DevOps & Cloud Architect",
    avatar: "CW",
    email: "chen.w@acme.dev",
    utilization: "optimal"
  },
  {
    id: "4",
    name: "Elena Rostova",
    role: "Product Manager",
    avatar: "ER",
    email: "elena.r@acme.dev",
    utilization: "underutilized"
  },
  {
    id: "5",
    name: "Marcus Aurelius",
    role: "Mobile Lead Engineer",
    avatar: "MA",
    email: "marcus.a@acme.dev",
    utilization: "optimal"
  }
];
var INITIAL_PROJECTS = [
  {
    id: "p1",
    name: "OmniSearch Engine",
    description: "Next-gen vector database search indexing service for enterprise knowledge graphs.",
    progress: 68,
    activeSprint: "Sprint 14 - Fast indexing",
    category: "Backend",
    repository: "github.com/acme/omnisearch-engine",
    issuesCount: 34,
    openIssues: 12,
    lastUpdated: "10m ago",
    teamIds: ["1", "3", "4"]
  },
  {
    id: "p2",
    name: "Sentinel Security Shield",
    description: "Zero-trust token authentication and session audit streaming engine with JWT fallback.",
    progress: 84,
    activeSprint: "Sprint 8 - OAuth integration",
    category: "Backend",
    repository: "github.com/acme/sentinel-shield",
    issuesCount: 18,
    openIssues: 4,
    lastUpdated: "1h ago",
    teamIds: ["1", "3"]
  },
  {
    id: "p3",
    name: "Horizon UI Components",
    description: "Modular design token system and highly reusable accessible components built with Tailwind v4.",
    progress: 42,
    activeSprint: "Sprint 3 - Accessibility",
    category: "Frontend",
    repository: "github.com/acme/horizon-ui",
    issuesCount: 45,
    openIssues: 26,
    lastUpdated: "3m ago",
    teamIds: ["2", "4"]
  },
  {
    id: "p4",
    name: "DevSync Mobile App",
    description: "Native iOS and Android client for remote team coordination, offline task synching, and instant push logs.",
    progress: 91,
    activeSprint: "Sprint 21 - Store release",
    category: "Mobile",
    repository: "github.com/acme/devsync-mobile",
    issuesCount: 12,
    openIssues: 2,
    lastUpdated: "2h ago",
    teamIds: ["5", "2"]
  },
  {
    id: "p5",
    name: "Aura Analytics Dashboard",
    description: "Real-time dashboard visualizing complex timeseries query data, active user retention, and infrastructure alerts.",
    progress: 15,
    activeSprint: "Sprint 1 - Foundations",
    category: "Frontend",
    repository: "github.com/acme/aura-dashboard",
    issuesCount: 22,
    openIssues: 19,
    lastUpdated: "1d ago",
    teamIds: ["2", "1"]
  }
];
var INITIAL_TASKS = [
  {
    id: "t1",
    title: "Optimize cosine similarity indexing algorithm",
    description: "Rewrite vector sorting in high-performance WebAssembly to scale indexing beyond 10M documents.",
    status: "inprogress",
    priority: "high",
    projectId: "p1",
    assigneeId: "1",
    // Abdselam
    dueDate: "2026-07-05",
    tags: ["performance", "wasm", "rust"]
  },
  {
    id: "t2",
    title: "Enforce JWT blacklist checking middleware",
    description: "Configure high-speed Redis key eviction for revoked OAuth tokens to protect critical APIs.",
    status: "done",
    priority: "high",
    projectId: "p2",
    assigneeId: "1",
    // Abdselam
    dueDate: "2026-06-29",
    tags: ["auth", "security", "redis"]
  },
  {
    id: "t3",
    title: "Draft component spec for accessible dropdowns",
    description: "Document comprehensive WAI-ARIA behavior, focus trapping rules, and keyboard shortcut listeners.",
    status: "inreview",
    priority: "medium",
    projectId: "p3",
    assigneeId: "2",
    // Sarah Jenkins
    dueDate: "2026-07-02",
    tags: ["design-system", "a11y"]
  },
  {
    id: "t4",
    title: "Implement swipe-to-delete animation in Task Row",
    description: "Use custom Motion anchors for extremely smooth, physics-based swipe triggers on iOS & Android list item cards.",
    status: "inprogress",
    priority: "medium",
    projectId: "p4",
    assigneeId: "5",
    // Marcus
    dueDate: "2026-07-06",
    tags: ["mobile", "animation", "ux"]
  },
  {
    id: "t5",
    title: "Add support for custom Tailwind theme overrides",
    description: "Integrate deep config resolution logic to override core gray scaling with custom dark slate settings.",
    status: "todo",
    priority: "high",
    projectId: "p3",
    assigneeId: "2",
    // Sarah Jenkins
    dueDate: "2026-07-10",
    tags: ["tailwind-v4", "styling"]
  },
  {
    id: "t6",
    title: "Configure automated Docker security vulnerability scan",
    description: "Add Trivy image scanners inside standard GitHub Actions builds to intercept vulnerable base images.",
    status: "done",
    priority: "medium",
    projectId: "p2",
    assigneeId: "3",
    // Chen Wei
    dueDate: "2026-06-28",
    tags: ["ci-cd", "security", "docker"]
  },
  {
    id: "t7",
    title: "Integrate dynamic timeseries charts in Aura core",
    description: "Implement complex lightweight Recharts area views to log server latency telemetry without frame drops.",
    status: "todo",
    priority: "high",
    projectId: "p5",
    assigneeId: "2",
    // Sarah Jenkins
    dueDate: "2026-07-15",
    tags: ["charts", "d3", "frontend"]
  },
  {
    id: "t8",
    title: "Map and index parent-child document linkages",
    description: "Establish structural edge connections inside the vector backend to index nested JSON hierarchies efficiently.",
    status: "todo",
    priority: "medium",
    projectId: "p1",
    assigneeId: "1",
    // Abdselam
    dueDate: "2026-07-08",
    tags: ["database", "graphs"]
  },
  {
    id: "t9",
    title: "Fix SQLite memory-leak on rapid app reload",
    description: "Correct connection pool disposal within the mobile platform layer when the activity is restarted by OS.",
    status: "inreview",
    priority: "high",
    projectId: "p4",
    assigneeId: "5",
    // Marcus
    dueDate: "2026-07-01",
    tags: ["sqlite", "memory", "bug"]
  },
  {
    id: "t10",
    title: "Establish baseline CI/CD setup for Aura deployment",
    description: "Write simple Cloud Run triggers with built-in cache layers to speed up frontend package building processes.",
    status: "inprogress",
    priority: "medium",
    projectId: "p5",
    assigneeId: "3",
    // Chen Wei
    dueDate: "2026-07-04",
    tags: ["devops", "gcp", "aura"]
  }
];
var INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    user: "Abdselam Al-Aswadi",
    avatar: "AA",
    action: "pushed 3 commits to branch",
    target: "omnisearch:opt-index",
    timestamp: "2m ago",
    type: "commit"
  },
  {
    id: "act-2",
    user: "Sarah Jenkins",
    avatar: "SJ",
    action: "resolved critical layout issue on",
    target: "Horizon Navigation bar",
    timestamp: "15m ago",
    type: "task"
  },
  {
    id: "act-3",
    user: "Chen Wei",
    avatar: "CW",
    action: "deployed a new preview cluster for",
    target: "Sentinel Gateway Shield",
    timestamp: "42m ago",
    type: "project"
  },
  {
    id: "act-4",
    user: "Marcus Aurelius",
    avatar: "MA",
    action: "submitted PR #43 in repo",
    target: "devsync-mobile:swipe-actions",
    timestamp: "1h ago",
    type: "commit"
  },
  {
    id: "act-5",
    user: "Elena Rostova",
    avatar: "ER",
    action: "updated release roadmap milestones for",
    target: "Horizon UI release cycle",
    timestamp: "3h ago",
    type: "project"
  }
];
var INITIAL_MILESTONES = [
  {
    id: "m1",
    projectId: "p1",
    name: "Vector similarity search MVP",
    dueDate: "2026-07-10",
    status: "pending",
    progress: 75
  },
  {
    id: "m2",
    projectId: "p2",
    name: "OAuth2 Single Sign-On Enforcement",
    dueDate: "2026-06-30",
    status: "completed",
    progress: 100
  },
  {
    id: "m3",
    projectId: "p3",
    name: "V4 Web Core Elements Package release",
    dueDate: "2026-07-20",
    status: "pending",
    progress: 40
  },
  {
    id: "m4",
    projectId: "p4",
    name: "App Store Sandbox Release",
    dueDate: "2026-07-05",
    status: "pending",
    progress: 90
  },
  {
    id: "m5",
    projectId: "p5",
    name: "Initial cloud telemetry portal online",
    dueDate: "2026-07-28",
    status: "pending",
    progress: 10
  }
];

// src/server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.set("trust proxy", 1);
app.use(express.json());
var SESSION_SECRET = process.env.SESSION_SECRET || "devsync_fallback_secret_change_me";
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1e3 * 60 * 60 * 24 * 7
    // 7 days
  }
}));
var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;
var isSupabaseConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project-id") && !supabaseKey.includes("your-supabase-service-role-key") && supabaseUrl !== "MY_SUPABASE_URL" && supabaseKey !== "MY_SUPABASE_KEY";
var supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
if (isSupabaseConfigured) {
  console.log("Backend: Supabase client initialized successfully.");
} else {
  console.warn("Backend: Supabase credentials not set or invalid in env. Using in-memory fallback database.");
}
var localProjects = [...INITIAL_PROJECTS];
var localTasks = [...INITIAL_TASKS];
var localTeamMembers = [...INITIAL_TEAM_MEMBERS];
var localActivities = [...INITIAL_ACTIVITIES];
var localMilestones = [...INITIAL_MILESTONES];
var FALLBACK_USERS = [
  {
    id: "u-1",
    username: "abdselam",
    displayName: "Abdselam",
    email: "abdselam@devsync.app",
    role: "admin",
    avatar: "AB",
    passwordHash: bcrypt.hashSync("DevSync@Abs2024!", 12)
  },
  {
    id: "u-2",
    username: "bereket",
    displayName: "Bereket",
    email: "bereket@devsync.app",
    role: "admin",
    avatar: "BE",
    passwordHash: bcrypt.hashSync("DevSync@Ber2024!", 12)
  }
];
function mapProjectFromDb(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
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
function mapProjectToDb(p) {
  const db = {};
  if (p.id !== void 0) db.id = p.id;
  if (p.name !== void 0) db.name = p.name;
  if (p.description !== void 0) db.description = p.description;
  if (p.progress !== void 0) db.progress = p.progress;
  if (p.activeSprint !== void 0) db.active_sprint = p.activeSprint;
  if (p.category !== void 0) db.category = p.category;
  if (p.repository !== void 0) db.repository = p.repository;
  if (p.issuesCount !== void 0) db.issues_count = p.issuesCount;
  if (p.openIssues !== void 0) db.open_issues = p.openIssues;
  if (p.lastUpdated !== void 0) db.last_updated = p.lastUpdated;
  if (p.teamIds !== void 0) db.team_ids = p.teamIds;
  return db;
}
function mapTaskFromDb(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    status: t.status,
    priority: t.priority,
    projectId: t.project_id,
    assigneeId: t.assignee_id || "",
    dueDate: t.due_date,
    tags: t.tags || []
  };
}
function mapTaskToDb(t) {
  const db = {};
  if (t.id !== void 0) db.id = t.id;
  if (t.title !== void 0) db.title = t.title;
  if (t.description !== void 0) db.description = t.description;
  if (t.status !== void 0) db.status = t.status;
  if (t.priority !== void 0) db.priority = t.priority;
  if (t.projectId !== void 0) db.project_id = t.projectId;
  if (t.assigneeId !== void 0) db.assignee_id = t.assigneeId || null;
  if (t.dueDate !== void 0) db.due_date = t.dueDate;
  if (t.tags !== void 0) db.tags = t.tags;
  return db;
}
function mapTeamMemberFromDb(m) {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    avatar: m.avatar,
    email: m.email,
    utilization: m.utilization
  };
}
function mapActivityFromDb(a) {
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
function mapActivityToDb(a) {
  const db = {};
  if (a.id !== void 0) db.id = a.id;
  if (a.user !== void 0) db.user_name = a.user;
  if (a.avatar !== void 0) db.avatar = a.avatar;
  if (a.action !== void 0) db.action = a.action;
  if (a.target !== void 0) db.target = a.target;
  if (a.timestamp !== void 0) db.timestamp = a.timestamp;
  if (a.type !== void 0) db.type = a.type;
  return db;
}
function mapMilestoneFromDb(m) {
  return {
    id: m.id,
    projectId: m.project_id,
    name: m.name,
    dueDate: m.due_date,
    status: m.status,
    progress: m.progress
  };
}
function mapMilestoneToDb(m) {
  const db = {};
  if (m.id !== void 0) db.id = m.id;
  if (m.projectId !== void 0) db.project_id = m.projectId;
  if (m.name !== void 0) db.name = m.name;
  if (m.dueDate !== void 0) db.due_date = m.dueDate;
  if (m.status !== void 0) db.status = m.status;
  if (m.progress !== void 0) db.progress = m.progress;
  return db;
}
function mapUserFromDb(u) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.display_name,
    email: u.email,
    role: u.role,
    avatar: u.avatar
  };
}
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized. Please log in." });
}
async function recalculateProjectProgress(projectId) {
  if (supabase) {
    const { data: dbTasks, error } = await supabase.from("tasks").select("*").eq("project_id", projectId);
    if (error || !dbTasks) return;
    const totalCount = dbTasks.length;
    const completedCount = dbTasks.filter((t) => t.status === "done").length;
    const progress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
    await supabase.from("projects").update({ progress, last_updated: "Just now" }).eq("id", projectId);
    const { data: dbMilestones } = await supabase.from("milestones").select("*").eq("project_id", projectId);
    if (dbMilestones) {
      for (const m of dbMilestones) {
        await supabase.from("milestones").update({
          progress,
          status: progress === 100 ? "completed" : m.status
        }).eq("id", m.id);
      }
    }
  } else {
    const projectTasks = localTasks.filter((t) => t.projectId === projectId);
    const totalCount = projectTasks.length;
    const completedCount = projectTasks.filter((t) => t.status === "done").length;
    const progress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
    localProjects = localProjects.map(
      (p) => p.id === projectId ? { ...p, progress, lastUpdated: "Just now" } : p
    );
    localMilestones = localMilestones.map(
      (m) => m.projectId === projectId ? { ...m, progress, status: progress === 100 ? "completed" : m.status } : m
    );
  }
}
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }
    let userRecord = null;
    if (supabase) {
      const { data, error } = await supabase.from("app_users").select("*").eq("username", username.toLowerCase().trim()).single();
      if (error) {
        const found = FALLBACK_USERS.find((u) => u.username === username.toLowerCase().trim());
        if (!found) {
          return res.status(401).json({ error: "Invalid username or password." });
        }
        userRecord = found;
      } else if (!data) {
        return res.status(401).json({ error: "Invalid username or password." });
      } else {
        userRecord = {
          ...mapUserFromDb(data),
          passwordHash: data.password_hash
        };
      }
    } else {
      const found = FALLBACK_USERS.find((u) => u.username === username.toLowerCase().trim());
      if (!found) {
        return res.status(401).json({ error: "Invalid username or password." });
      }
      userRecord = found;
    }
    const isValid = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    const safeUser = {
      id: userRecord.id,
      username: userRecord.username,
      displayName: userRecord.displayName,
      email: userRecord.email,
      role: userRecord.role,
      avatar: userRecord.avatar
    };
    req.session.user = safeUser;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to create session." });
      }
      return res.json({ user: safeUser });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/auth/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ error: "Not authenticated." });
});
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to destroy session." });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully." });
  });
});
app.get("/api/team", requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("team_members").select("*");
      if (error) throw error;
      res.json(data.map(mapTeamMemberFromDb));
    } else {
      res.json(localTeamMembers);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/projects", requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("projects").select("*");
      if (error) throw error;
      res.json(data.map(mapProjectFromDb));
    } else {
      res.json(localProjects);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/projects", requireAuth, async (req, res) => {
  try {
    const { name, description, category, repository, activeSprint } = req.body;
    const newId = `p-${Date.now()}`;
    const newProject = {
      id: newId,
      name,
      description: description || "",
      progress: 0,
      activeSprint,
      category,
      repository,
      issuesCount: 2,
      openIssues: 2,
      lastUpdated: "Just now",
      teamIds: ["1", "2"]
    };
    const defaultTasks = [
      {
        id: `t-${Date.now()}-1`,
        title: `Draft system design specifications`,
        description: `Map microservices schema, state matrices, and security tokens for ${name}.`,
        status: "todo",
        priority: "high",
        projectId: newId,
        assigneeId: "1",
        dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        tags: ["architecture", "planning"]
      },
      {
        id: `t-${Date.now()}-2`,
        title: `Configure base pipeline scaffolding`,
        description: `Bootstrap project structure, ESLint validation, Tailwind configuration, and docker config.`,
        status: "todo",
        priority: "medium",
        projectId: newId,
        assigneeId: "2",
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
        tags: ["setup", "ci-cd"]
      }
    ];
    const newMilestone = {
      id: `m-${Date.now()}`,
      projectId: newId,
      name: `Release V1 Core Interface`,
      dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      status: "pending",
      progress: 0
    };
    const sessionUser = req.session.user;
    const newActivity = {
      id: `act-${Date.now()}`,
      user: sessionUser.displayName,
      avatar: sessionUser.avatar,
      action: "initialized repository context",
      target: repository,
      timestamp: "Just now",
      type: "project"
    };
    if (supabase) {
      const { error: pErr } = await supabase.from("projects").insert(mapProjectToDb(newProject));
      if (pErr) throw pErr;
      const { error: tErr } = await supabase.from("tasks").insert(defaultTasks.map(mapTaskToDb));
      if (tErr) throw tErr;
      const { error: mErr } = await supabase.from("milestones").insert(mapMilestoneToDb(newMilestone));
      if (mErr) throw mErr;
      const { error: aErr } = await supabase.from("activities").insert(mapActivityToDb(newActivity));
      if (aErr) throw aErr;
      res.status(201).json(newProject);
    } else {
      localProjects = [newProject, ...localProjects];
      localTasks = [...localTasks, ...defaultTasks];
      localMilestones = [...localMilestones, newMilestone];
      localActivities = [newActivity, ...localActivities];
      res.status(201).json(newProject);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("tasks").select("*");
      if (error) throw error;
      res.json(data.map(mapTaskFromDb));
    } else {
      res.json(localTasks);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/tasks", requireAuth, async (req, res) => {
  try {
    const { title, description, priority, projectId, assigneeId, dueDate, tags } = req.body;
    const newId = `t-${Date.now()}`;
    const newTask = {
      id: newId,
      title,
      description: description || "",
      status: "todo",
      priority,
      projectId,
      assigneeId: assigneeId || "",
      dueDate,
      tags: tags || []
    };
    let memberName = "Someone";
    let memberAvatar = "??";
    let projectName = "Unknown";
    if (supabase) {
      const { data: member } = await supabase.from("team_members").select("*").eq("id", assigneeId || "").single();
      if (member) {
        memberName = member.name;
        memberAvatar = member.avatar;
      }
      const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single();
      if (project) {
        projectName = project.name;
      }
      const newActivity = {
        id: `act-${Date.now()}`,
        user: memberName,
        avatar: memberAvatar,
        action: `received assignment for "${title.substring(0, 20)}..." in`,
        target: projectName,
        timestamp: "Just now",
        type: "task"
      };
      const { error: tErr } = await supabase.from("tasks").insert(mapTaskToDb(newTask));
      if (tErr) throw tErr;
      const { error: aErr } = await supabase.from("activities").insert(mapActivityToDb(newActivity));
      if (aErr) throw aErr;
      const { data: allProjTasks } = await supabase.from("tasks").select("*").eq("project_id", projectId);
      if (allProjTasks) {
        const total = allProjTasks.length;
        const open = allProjTasks.filter((t) => t.status !== "done").length;
        await supabase.from("projects").update({
          issues_count: total,
          open_issues: open
        }).eq("id", projectId);
      }
      await recalculateProjectProgress(projectId);
      res.status(201).json(newTask);
    } else {
      const member = localTeamMembers.find((m) => m.id === assigneeId) || { name: "Someone", avatar: "??" };
      const project = localProjects.find((p) => p.id === projectId) || { name: "Unknown" };
      memberName = member.name;
      memberAvatar = member.avatar;
      projectName = project.name;
      const newActivity = {
        id: `act-${Date.now()}`,
        user: memberName,
        avatar: memberAvatar,
        action: `received assignment for "${title.substring(0, 20)}..." in`,
        target: projectName,
        timestamp: "Just now",
        type: "task"
      };
      localTasks = [newTask, ...localTasks];
      localActivities = [newActivity, ...localActivities];
      localProjects = localProjects.map((p) => {
        if (p.id === projectId) {
          const allProjTasks = localTasks.filter((t) => t.projectId === projectId);
          return {
            ...p,
            issuesCount: allProjTasks.length,
            openIssues: allProjTasks.filter((t) => t.status !== "done").length
          };
        }
        return p;
      });
      await recalculateProjectProgress(projectId);
      res.status(201).json(newTask);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigneeId } = req.body;
    let updatedTask = null;
    let oldTask = null;
    if (supabase) {
      const { data: dbTask, error: fErr } = await supabase.from("tasks").select("*").eq("id", id).single();
      if (fErr || !dbTask) {
        return res.status(404).json({ error: "Task not found" });
      }
      oldTask = mapTaskFromDb(dbTask);
      const updates = {};
      if (status !== void 0) updates.status = status;
      if (assigneeId !== void 0) updates.assignee_id = assigneeId || null;
      const { data: finalDbTask, error: uErr } = await supabase.from("tasks").update(updates).eq("id", id).select("*").single();
      if (uErr || !finalDbTask) throw uErr;
      updatedTask = mapTaskFromDb(finalDbTask);
      if (status !== void 0 && oldTask.status !== status) {
        const { data: member } = await supabase.from("team_members").select("*").eq("id", updatedTask.assigneeId).single();
        const memberName = member?.name || "Someone";
        const memberAvatar = member?.avatar || "??";
        const newAct = {
          id: `act-${Date.now()}`,
          user: memberName,
          avatar: memberAvatar,
          action: `shifted status of "${updatedTask.title.substring(0, 24)}..." to`,
          target: status.toUpperCase(),
          timestamp: "Just now",
          type: "task"
        };
        await supabase.from("activities").insert(mapActivityToDb(newAct));
      }
      if (assigneeId !== void 0 && oldTask.assigneeId !== assigneeId) {
        const { data: member } = await supabase.from("team_members").select("*").eq("id", assigneeId).single();
        const memberName = member?.name || "Someone";
        const memberAvatar = member?.avatar || "??";
        const newAct = {
          id: `act-${Date.now()}`,
          user: memberName,
          avatar: memberAvatar,
          action: `accepted deployment dispatch for`,
          target: updatedTask.title.substring(0, 24) + "...",
          timestamp: "Just now",
          type: "task"
        };
        await supabase.from("activities").insert(mapActivityToDb(newAct));
      }
      const { data: allProjTasks } = await supabase.from("tasks").select("*").eq("project_id", updatedTask.projectId);
      if (allProjTasks) {
        const open = allProjTasks.filter((t) => t.status !== "done").length;
        await supabase.from("projects").update({
          open_issues: open
        }).eq("id", updatedTask.projectId);
      }
      await recalculateProjectProgress(updatedTask.projectId);
      res.json(updatedTask);
    } else {
      const idx = localTasks.findIndex((t) => t.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Task not found" });
      }
      oldTask = localTasks[idx];
      const localUpdated = { ...oldTask };
      if (status !== void 0) localUpdated.status = status;
      if (assigneeId !== void 0) localUpdated.assigneeId = assigneeId;
      localTasks[idx] = localUpdated;
      updatedTask = localUpdated;
      if (status !== void 0 && oldTask.status !== status) {
        const member = localTeamMembers.find((m) => m.id === updatedTask.assigneeId) || { name: "Someone", avatar: "??" };
        const newAct = {
          id: `act-${Date.now()}`,
          user: member.name,
          avatar: member.avatar,
          action: `shifted status of "${updatedTask.title.substring(0, 24)}..." to`,
          target: status.toUpperCase(),
          timestamp: "Just now",
          type: "task"
        };
        localActivities = [newAct, ...localActivities];
      }
      if (assigneeId !== void 0 && oldTask.assigneeId !== assigneeId) {
        const member = localTeamMembers.find((m) => m.id === assigneeId) || { name: "Someone", avatar: "??" };
        const newAct = {
          id: `act-${Date.now()}`,
          user: member.name,
          avatar: member.avatar,
          action: `accepted deployment dispatch for`,
          target: updatedTask.title.substring(0, 24) + "...",
          timestamp: "Just now",
          type: "task"
        };
        localActivities = [newAct, ...localActivities];
      }
      localProjects = localProjects.map((p) => {
        if (p.id === updatedTask.projectId) {
          const allProjTasks = localTasks.filter((t) => t.projectId === updatedTask.projectId);
          return {
            ...p,
            openIssues: allProjTasks.filter((t) => t.status !== "done").length
          };
        }
        return p;
      });
      await recalculateProjectProgress(updatedTask.projectId);
      res.json(updatedTask);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/activities", requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      res.json(data.map(mapActivityFromDb));
    } else {
      res.json(localActivities);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/activities", requireAuth, async (req, res) => {
  try {
    const { user, avatar, action, target, type } = req.body;
    const newId = `act-sim-${Date.now()}`;
    const newAct = {
      id: newId,
      user,
      avatar,
      action,
      target,
      timestamp: "Just now",
      type
    };
    if (supabase) {
      const { error } = await supabase.from("activities").insert(mapActivityToDb(newAct));
      if (error) throw error;
      res.status(201).json(newAct);
    } else {
      localActivities = [newAct, ...localActivities];
      res.status(201).json(newAct);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/milestones", requireAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("milestones").select("*");
      if (error) throw error;
      res.json(data.map(mapMilestoneFromDb));
    } else {
      res.json(localMilestones);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";
  const port = parseInt(process.env.PORT || "3000", 10);
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Backend: Vite dev server mounted in middleware mode.");
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
    console.log(`Backend: Serving static assets in production from: ${distPath}`);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Backend: Server is running on http://localhost:${port}`);
  });
}
var server_default = app;
if (!process.env.VERCEL) {
  startServer();
}
export {
  server_default as default
};
