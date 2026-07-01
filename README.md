# Simple Project Management App

## Overview
A lightweight project management web application built with Vite, TypeScript, and Express. It uses Supabase as the backend database for storing projects, tasks, milestones, activities, and team members.

## Features
- Create, edit, delete projects and tasks
- Track progress with milestones and activities
- Real‑time updates via REST APIs
- Fully configurable via environment variables

## Prerequisites
- **Node.js** (v18 or later)
- **npm** (comes with Node)
- A **Supabase** account and project

## Setup
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd SimpleProjectManagement
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Supabase**
   - Create a new project in Supabase.
   - Run the schema file to set up tables:
     ```bash
     supabase db reset --file supabase_schema.sql
     ```
   - Copy `.env.example` to `.env` and fill in the values:
     ```
     SUPABASE_URL=your-supabase-url
     SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## Build for Production
```bash
npm run build
# Then start the server
npm start
```

## Database Schema
The Supabase schema is defined in `supabase_schema.sql`. It includes tables for:
- `projects`
- `tasks`
- `milestones`
- `activities`
- `team_members`

## Environment Variables
| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL of your Supabase project |
| `SUPABASE_ANON_KEY` | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server‑side operations |

## Contributing
Feel free to open issues or submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT License
