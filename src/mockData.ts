import { Project, Task, TeamMember, Activity, Milestone } from './types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Abdselam Al-Aswadi',
    role: 'Tech Lead / Senior Backend',
    avatar: 'AA',
    email: 'abdselam@acme.dev',
    utilization: 'optimal'
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    role: 'Staff Frontend Architect',
    avatar: 'SJ',
    email: 'sarah.j@acme.dev',
    utilization: 'overloaded'
  },
  {
    id: '3',
    name: 'Chen Wei',
    role: 'DevOps & Cloud Architect',
    avatar: 'CW',
    email: 'chen.w@acme.dev',
    utilization: 'optimal'
  },
  {
    id: '4',
    name: 'Elena Rostova',
    role: 'Product Manager',
    avatar: 'ER',
    email: 'elena.r@acme.dev',
    utilization: 'underutilized'
  },
  {
    id: '5',
    name: 'Marcus Aurelius',
    role: 'Mobile Lead Engineer',
    avatar: 'MA',
    email: 'marcus.a@acme.dev',
    utilization: 'optimal'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'OmniSearch Engine',
    description: 'Next-gen vector database search indexing service for enterprise knowledge graphs.',
    progress: 68,
    activeSprint: 'Sprint 14 - Fast indexing',
    category: 'Backend',
    repository: 'github.com/acme/omnisearch-engine',
    issuesCount: 34,
    openIssues: 12,
    lastUpdated: '10m ago',
    teamIds: ['1', '3', '4']
  },
  {
    id: 'p2',
    name: 'Sentinel Security Shield',
    description: 'Zero-trust token authentication and session audit streaming engine with JWT fallback.',
    progress: 84,
    activeSprint: 'Sprint 8 - OAuth integration',
    category: 'Backend',
    repository: 'github.com/acme/sentinel-shield',
    issuesCount: 18,
    openIssues: 4,
    lastUpdated: '1h ago',
    teamIds: ['1', '3']
  },
  {
    id: 'p3',
    name: 'Horizon UI Components',
    description: 'Modular design token system and highly reusable accessible components built with Tailwind v4.',
    progress: 42,
    activeSprint: 'Sprint 3 - Accessibility',
    category: 'Frontend',
    repository: 'github.com/acme/horizon-ui',
    issuesCount: 45,
    openIssues: 26,
    lastUpdated: '3m ago',
    teamIds: ['2', '4']
  },
  {
    id: 'p4',
    name: 'DevSync Mobile App',
    description: 'Native iOS and Android client for remote team coordination, offline task synching, and instant push logs.',
    progress: 91,
    activeSprint: 'Sprint 21 - Store release',
    category: 'Mobile',
    repository: 'github.com/acme/devsync-mobile',
    issuesCount: 12,
    openIssues: 2,
    lastUpdated: '2h ago',
    teamIds: ['5', '2']
  },
  {
    id: 'p5',
    name: 'Aura Analytics Dashboard',
    description: 'Real-time dashboard visualizing complex timeseries query data, active user retention, and infrastructure alerts.',
    progress: 15,
    activeSprint: 'Sprint 1 - Foundations',
    category: 'Frontend',
    repository: 'github.com/acme/aura-dashboard',
    issuesCount: 22,
    openIssues: 19,
    lastUpdated: '1d ago',
    teamIds: ['2', '1']
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Optimize cosine similarity indexing algorithm',
    description: 'Rewrite vector sorting in high-performance WebAssembly to scale indexing beyond 10M documents.',
    status: 'inprogress',
    priority: 'high',
    projectId: 'p1',
    assigneeId: '1', // Abdselam
    dueDate: '2026-07-05',
    tags: ['performance', 'wasm', 'rust']
  },
  {
    id: 't2',
    title: 'Enforce JWT blacklist checking middleware',
    description: 'Configure high-speed Redis key eviction for revoked OAuth tokens to protect critical APIs.',
    status: 'done',
    priority: 'high',
    projectId: 'p2',
    assigneeId: '1', // Abdselam
    dueDate: '2026-06-29',
    tags: ['auth', 'security', 'redis']
  },
  {
    id: 't3',
    title: 'Draft component spec for accessible dropdowns',
    description: 'Document comprehensive WAI-ARIA behavior, focus trapping rules, and keyboard shortcut listeners.',
    status: 'inreview',
    priority: 'medium',
    projectId: 'p3',
    assigneeId: '2', // Sarah Jenkins
    dueDate: '2026-07-02',
    tags: ['design-system', 'a11y']
  },
  {
    id: 't4',
    title: 'Implement swipe-to-delete animation in Task Row',
    description: 'Use custom Motion anchors for extremely smooth, physics-based swipe triggers on iOS & Android list item cards.',
    status: 'inprogress',
    priority: 'medium',
    projectId: 'p4',
    assigneeId: '5', // Marcus
    dueDate: '2026-07-06',
    tags: ['mobile', 'animation', 'ux']
  },
  {
    id: 't5',
    title: 'Add support for custom Tailwind theme overrides',
    description: 'Integrate deep config resolution logic to override core gray scaling with custom dark slate settings.',
    status: 'todo',
    priority: 'high',
    projectId: 'p3',
    assigneeId: '2', // Sarah Jenkins
    dueDate: '2026-07-10',
    tags: ['tailwind-v4', 'styling']
  },
  {
    id: 't6',
    title: 'Configure automated Docker security vulnerability scan',
    description: 'Add Trivy image scanners inside standard GitHub Actions builds to intercept vulnerable base images.',
    status: 'done',
    priority: 'medium',
    projectId: 'p2',
    assigneeId: '3', // Chen Wei
    dueDate: '2026-06-28',
    tags: ['ci-cd', 'security', 'docker']
  },
  {
    id: 't7',
    title: 'Integrate dynamic timeseries charts in Aura core',
    description: 'Implement complex lightweight Recharts area views to log server latency telemetry without frame drops.',
    status: 'todo',
    priority: 'high',
    projectId: 'p5',
    assigneeId: '2', // Sarah Jenkins
    dueDate: '2026-07-15',
    tags: ['charts', 'd3', 'frontend']
  },
  {
    id: 't8',
    title: 'Map and index parent-child document linkages',
    description: 'Establish structural edge connections inside the vector backend to index nested JSON hierarchies efficiently.',
    status: 'todo',
    priority: 'medium',
    projectId: 'p1',
    assigneeId: '1', // Abdselam
    dueDate: '2026-07-08',
    tags: ['database', 'graphs']
  },
  {
    id: 't9',
    title: 'Fix SQLite memory-leak on rapid app reload',
    description: 'Correct connection pool disposal within the mobile platform layer when the activity is restarted by OS.',
    status: 'inreview',
    priority: 'high',
    projectId: 'p4',
    assigneeId: '5', // Marcus
    dueDate: '2026-07-01',
    tags: ['sqlite', 'memory', 'bug']
  },
  {
    id: 't10',
    title: 'Establish baseline CI/CD setup for Aura deployment',
    description: 'Write simple Cloud Run triggers with built-in cache layers to speed up frontend package building processes.',
    status: 'inprogress',
    priority: 'medium',
    projectId: 'p5',
    assigneeId: '3', // Chen Wei
    dueDate: '2026-07-04',
    tags: ['devops', 'gcp', 'aura']
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    user: 'Abdselam Al-Aswadi',
    avatar: 'AA',
    action: 'pushed 3 commits to branch',
    target: 'omnisearch:opt-index',
    timestamp: '2m ago',
    type: 'commit'
  },
  {
    id: 'act-2',
    user: 'Sarah Jenkins',
    avatar: 'SJ',
    action: 'resolved critical layout issue on',
    target: 'Horizon Navigation bar',
    timestamp: '15m ago',
    type: 'task'
  },
  {
    id: 'act-3',
    user: 'Chen Wei',
    avatar: 'CW',
    action: 'deployed a new preview cluster for',
    target: 'Sentinel Gateway Shield',
    timestamp: '42m ago',
    type: 'project'
  },
  {
    id: 'act-4',
    user: 'Marcus Aurelius',
    avatar: 'MA',
    action: 'submitted PR #43 in repo',
    target: 'devsync-mobile:swipe-actions',
    timestamp: '1h ago',
    type: 'commit'
  },
  {
    id: 'act-5',
    user: 'Elena Rostova',
    avatar: 'ER',
    action: 'updated release roadmap milestones for',
    target: 'Horizon UI release cycle',
    timestamp: '3h ago',
    type: 'project'
  }
];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Vector similarity search MVP',
    dueDate: '2026-07-10',
    status: 'pending',
    progress: 75
  },
  {
    id: 'm2',
    projectId: 'p2',
    name: 'OAuth2 Single Sign-On Enforcement',
    dueDate: '2026-06-30',
    status: 'completed',
    progress: 100
  },
  {
    id: 'm3',
    projectId: 'p3',
    name: 'V4 Web Core Elements Package release',
    dueDate: '2026-07-20',
    status: 'pending',
    progress: 40
  },
  {
    id: 'm4',
    projectId: 'p4',
    name: 'App Store Sandbox Release',
    dueDate: '2026-07-05',
    status: 'pending',
    progress: 90
  },
  {
    id: 'm5',
    projectId: 'p5',
    name: 'Initial cloud telemetry portal online',
    dueDate: '2026-07-28',
    status: 'pending',
    progress: 10
  }
];
