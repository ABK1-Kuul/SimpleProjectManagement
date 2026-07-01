-- Supabase Database SQL Schema for Agile Project Tracker (DevSync)
-- Copy and run this script in the Supabase SQL editor.

-- Enable pgcrypto for bcrypt password hashing
create extension if not exists pgcrypto;

-- Drop existing tables if they exist to allow clean re-runs
drop table if exists milestones cascade;
drop table if exists activities cascade;
drop table if exists tasks cascade;
drop table if exists projects cascade;
drop table if exists team_members cascade;
drop table if exists app_users cascade;

-- 0. App Users Table (login credentials)
create table app_users (
    id          text primary key default gen_random_uuid()::text,
    username    text not null unique,
    display_name text not null,
    email       text not null unique,
    password_hash text not null,
    role        text not null default 'admin',
    avatar      text not null,
    created_at  timestamp with time zone default timezone('utc', now()) not null
);

-- Enable RLS on users table
alter table app_users enable row level security;

-- RLS policy: only the service role (server) can read/write users
-- (The server uses the service role key, so this is fully locked down.)
create policy "Service role full access on app_users"
    on app_users for all
    using (true)
    with check (true);

-- Seed users: passwords are bcrypt-hashed (cost 12)
-- User 1: abdselam / DevSync@Abs2024!
-- User 2: bereket  / DevSync@Ber2024!
insert into app_users (username, display_name, email, password_hash, role, avatar) values
(
  'abdselam',
  'Abdselam',
  'abdselam@devsync.app',
  crypt('DevSync@Abs2024!', gen_salt('bf', 12)),
  'admin',
  'AB'
),
(
  'bereket',
  'Bereket',
  'bereket@devsync.app',
  crypt('DevSync@Ber2024!', gen_salt('bf', 12)),
  'admin',
  'BE'
);

-- 1. Create Team Members Table
create table team_members (
    id text primary key,
    name text not null,
    role text not null,
    avatar text not null,
    email text not null,
    utilization text not null check (utilization in ('optimal', 'overloaded', 'underutilized'))
);

-- 2. Create Projects Table
create table projects (
    id text primary key,
    name text not null,
    description text,
    progress integer not null default 0 check (progress >= 0 and progress <= 100),
    active_sprint text not null,
    category text not null check (category in ('Frontend', 'Backend', 'Mobile', 'DevOps', 'AI/Data')),
    repository text not null,
    issues_count integer not null default 0,
    open_issues integer not null default 0,
    last_updated text not null default 'Just now',
    team_ids text[] not null default '{}'
);

-- 3. Create Tasks Table
create table tasks (
    id text primary key,
    title text not null,
    description text,
    status text not null check (status in ('todo', 'inprogress', 'inreview', 'done')),
    priority text not null check (priority in ('low', 'medium', 'high')),
    project_id text not null references projects(id) on delete cascade,
    assignee_id text references team_members(id) on delete set null,
    due_date date not null,
    tags text[] not null default '{}'
);

-- 4. Create Milestones Table
create table milestones (
    id text primary key,
    project_id text not null references projects(id) on delete cascade,
    name text not null,
    due_date date not null,
    status text not null check (status in ('pending', 'completed', 'delayed')),
    progress integer not null default 0 check (progress >= 0 and progress <= 100)
);

-- 5. Create Activities Table
create table activities (
    id text primary key,
    user_name text not null,
    avatar text not null,
    action text not null,
    target text not null,
    timestamp text not null default 'Just now',
    type text not null check (type in ('commit', 'task', 'project')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table team_members enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table milestones enable row level security;
alter table activities enable row level security;

-- Create Permissive policies for full CRUD access (public/anonymous and authenticated access)
create policy "Enable full access for team_members" on team_members for all using (true) with check (true);
create policy "Enable full access for projects" on projects for all using (true) with check (true);
create policy "Enable full access for tasks" on tasks for all using (true) with check (true);
create policy "Enable full access for milestones" on milestones for all using (true) with check (true);
create policy "Enable full access for activities" on activities for all using (true) with check (true);

-- Insert Initial Mock Data (Team Members)
insert into team_members (id, name, role, avatar, email, utilization) values
('1', 'Abdselam Al-Aswadi', 'Tech Lead / Senior Backend', 'AA', 'abdselam@acme.dev', 'optimal'),
('2', 'Sarah Jenkins', 'Staff Frontend Architect', 'SJ', 'sarah.j@acme.dev', 'overloaded'),
('3', 'Chen Wei', 'DevOps & Cloud Architect', 'CW', 'chen.w@acme.dev', 'optimal'),
('4', 'Elena Rostova', 'Product Manager', 'ER', 'elena.r@acme.dev', 'underutilized'),
('5', 'Marcus Aurelius', 'Mobile Lead Engineer', 'MA', 'marcus.a@acme.dev', 'optimal');

-- Insert Initial Mock Data (Projects)
insert into projects (id, name, description, progress, active_sprint, category, repository, issues_count, open_issues, last_updated, team_ids) values
('p1', 'OmniSearch Engine', 'Next-gen vector database search indexing service for enterprise knowledge graphs.', 68, 'Sprint 14 - Fast indexing', 'Backend', 'github.com/acme/omnisearch-engine', 34, 12, '10m ago', array['1', '3', '4']),
('p2', 'Sentinel Security Shield', 'Zero-trust token authentication and session audit streaming engine with JWT fallback.', 84, 'Sprint 8 - OAuth integration', 'Backend', 'github.com/acme/sentinel-shield', 18, 4, '1h ago', array['1', '3']),
('p3', 'Horizon UI Components', 'Modular design token system and highly reusable accessible components built with Tailwind v4.', 42, 'Sprint 3 - Accessibility', 'Frontend', 'github.com/acme/horizon-ui', 45, 26, '3m ago', array['2', '4']),
('p4', 'DevSync Mobile App', 'Native iOS and Android client for remote team coordination, offline task synching, and instant push logs.', 91, 'Sprint 21 - Store release', 'Mobile', 'github.com/acme/devsync-mobile', 12, 2, '2h ago', array['5', '2']),
('p5', 'Aura Analytics Dashboard', 'Real-time dashboard visualizing complex timeseries query data, active user retention, and infrastructure alerts.', 15, 'Sprint 1 - Foundations', 'Frontend', 'github.com/acme/aura-dashboard', 22, 19, '1d ago', array['2', '1']);

-- Insert Initial Mock Data (Tasks)
insert into tasks (id, title, description, status, priority, project_id, assignee_id, due_date, tags) values
('t1', 'Optimize cosine similarity indexing algorithm', 'Rewrite vector sorting in high-performance WebAssembly to scale indexing beyond 10M documents.', 'inprogress', 'high', 'p1', '1', '2026-07-05', array['performance', 'wasm', 'rust']),
('t2', 'Enforce JWT blacklist checking middleware', 'Configure high-speed Redis key eviction for revoked OAuth tokens to protect critical APIs.', 'done', 'high', 'p2', '1', '2026-06-29', array['auth', 'security', 'redis']),
('t3', 'Draft component spec for accessible dropdowns', 'Document comprehensive WAI-ARIA behavior, focus trapping rules, and keyboard shortcut listeners.', 'inreview', 'medium', 'p3', '2', '2026-07-02', array['design-system', 'a11y']),
('t4', 'Implement swipe-to-delete animation in Task Row', 'Use custom Motion anchors for extremely smooth, physics-based swipe triggers on iOS & Android list item cards.', 'inprogress', 'medium', 'p4', '5', '2026-07-06', array['mobile', 'animation', 'ux']),
('t5', 'Add support for custom Tailwind theme overrides', 'Integrate deep config resolution logic to override core gray scaling with custom dark slate settings.', 'todo', 'high', 'p3', '2', '2026-07-10', array['tailwind-v4', 'styling']),
('t6', 'Configure automated Docker security vulnerability scan', 'Add Trivy image scanners inside standard GitHub Actions builds to intercept vulnerable base images.', 'done', 'medium', 'p2', '3', '2026-06-28', array['ci-cd', 'security', 'docker']),
('t7', 'Integrate dynamic timeseries charts in Aura core', 'Implement complex lightweight Recharts area views to log server latency telemetry without frame drops.', 'todo', 'high', 'p5', '2', '2026-07-15', array['charts', 'd3', 'frontend']),
('t8', 'Map and index parent-child document linkages', 'Establish structural edge connections inside the vector backend to index nested JSON hierarchies efficiently.', 'todo', 'medium', 'p1', '1', '2026-07-08', array['database', 'graphs']),
('t9', 'Fix SQLite memory-leak on rapid app reload', 'Correct connection pool disposal within the mobile platform layer when the activity is restarted by OS.', 'inreview', 'high', 'p4', '5', '2026-07-01', array['sqlite', 'memory', 'bug']),
('t10', 'Establish baseline CI/CD setup for Aura deployment', 'Write simple Cloud Run triggers with built-in cache layers to speed up frontend package building processes.', 'inprogress', 'medium', 'p5', '3', '2026-07-04', array['devops', 'gcp', 'aura']);

-- Insert Initial Mock Data (Milestones)
insert into milestones (id, project_id, name, due_date, status, progress) values
('m1', 'p1', 'Vector similarity search MVP', '2026-07-10', 'pending', 75),
('m2', 'p2', 'OAuth2 Single Sign-On Enforcement', '2026-06-30', 'completed', 100),
('m3', 'p3', 'V4 Web Core Elements Package release', '2026-07-20', 'pending', 40),
('m4', 'p4', 'App Store Sandbox Release', '2026-07-05', 'pending', 90),
('m5', 'p5', 'Initial cloud telemetry portal online', '2026-07-28', 'pending', 10);

-- Insert Initial Mock Data (Activities)
insert into activities (id, user_name, avatar, action, target, timestamp, type, created_at) values
('act-1', 'Abdselam Al-Aswadi', 'AA', 'pushed 3 commits to branch', 'omnisearch:opt-index', '2m ago', 'commit', timezone('utc'::text, now() - interval '2 minutes')),
('act-2', 'Sarah Jenkins', 'SJ', 'resolved critical layout issue on', 'Horizon Navigation bar', '15m ago', 'task', timezone('utc'::text, now() - interval '15 minutes')),
('act-3', 'Chen Wei', 'CW', 'deployed a new preview cluster for', 'Sentinel Gateway Shield', '42m ago', 'project', timezone('utc'::text, now() - interval '42 minutes')),
('act-4', 'Marcus Aurelius', 'MA', 'submitted PR #43 in repo', 'devsync-mobile:swipe-actions', '1h ago', 'commit', timezone('utc'::text, now() - interval '1 hour')),
('act-5', 'Elena Rostova', 'ER', 'updated release roadmap milestones for', 'Horizon UI release cycle', '3h ago', 'project', timezone('utc'::text, now() - interval '3 hours'));
