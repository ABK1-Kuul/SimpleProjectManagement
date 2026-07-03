# DevSync Project Improvements - Implementation Plan

## ✅ Completed
- [x] Install dependencies: React Query, dnd-kit, react-hot-toast, express-rate-limit

## 🚀 Phase 1: Infrastructure & Security (Priority: CRITICAL)

### Backend Security
- [ ] Add JWT secret validation on server startup (fail if missing in production)
- [ ] Add rate limiting to `/api/auth/login` (5 attempts per 15min per IP)
- [ ] Add CSRF protection or document SameSite=Lax cookie policy
- [ ] Add input validation/sanitization middleware

### Toast Notification System
- [ ] Add Toaster component to App.tsx root
- [ ] Create useToast hook wrapper
- [ ] Style toasts to match dark theme

### React Query Setup
- [ ] Create QueryClient in main.tsx
- [ ] Wrap app with QueryClientProvider
- [ ] Create custom hooks: useProjects, useTasks, useTeam, useActivities, useMilestones
- [ ] Add mutation hooks: useCreateProject, useUpdateTask, etc.

---

## 📊 Phase 2: Backend API Enhancements

### New Endpoints
- [ ] `DELETE /api/projects/:id` - soft delete project
- [ ] `PUT /api/projects/:id` - full project edit
- [ ] `DELETE /api/tasks/:id` - soft delete task  
- [ ] `PUT /api/tasks/:id` - full task edit (title, description, priority, dueDate, tags)
- [ ] `GET /api/team/:id/utilization` - dynamic utilization calculation

### Database Changes
- [ ] Add `deleted_at` column to projects table (nullable timestamp)
- [ ] Add `deleted_at` column to tasks table (nullable timestamp)
- [ ] Update all queries to filter `WHERE deleted_at IS NULL`
- [ ] Add migration script or update supabase_schema.sql

### Dynamic Utilization
- [ ] Remove static `utilization` field from team_members table
- [ ] Compute utilization in `GET /api/team` response based on active task count
  - 0-1 tasks = underutilized
  - 2-5 tasks = optimal  
  - 6+ tasks = overloaded

### Activity Logging
- [ ] Create centralized `logActivity()` helper function
- [ ] Call from every mutation endpoint (create, update, delete)
- [ ] Remove manual activity creation from handlers

### Remove Demo Features
- [ ] Delete `/api/activities POST` endpoint (no more manual activity injection)
- [ ] Remove simulate activity button from Header.tsx

---

## 🎨 Phase 3: Frontend - Data Management

### Replace refreshData with React Query
- [ ] Remove all `refreshData()` calls from App.tsx
- [ ] Use `invalidateQueries` in mutation onSuccess callbacks
- [ ] Add optimistic updates for task status changes
- [ ] Add loading states from useQuery

### Error Handling
- [ ] Show toast on API errors
- [ ] Show toast on success (create, update, delete)
- [ ] Add retry mechanism for failed mutations
- [ ] Add error boundary component

---

## 🎯 Phase 4: Frontend - CRUD Operations

### Task Editing
- [ ] Create EditTaskModal component (similar to NewTaskModal)
- [ ] Add edit button to task cards in KanbanView
- [ ] Wire up `PUT /api/tasks/:id` endpoint
- [ ] Show toast on success

### Task Deletion
- [ ] Add delete button to task cards (with confirmation)
- [ ] Wire up `DELETE /api/tasks/:id` endpoint
- [ ] Show toast on success
- [ ] Add "undo" functionality (restore within 5s)

### Project Editing
- [ ] Create EditProjectModal component
- [ ] Add edit button to project cards in DashboardView
- [ ] Wire up `PUT /api/projects/:id` endpoint
- [ ] Show toast on success

### Project Deletion
- [ ] Add delete button to project cards (with confirmation modal)
- [ ] Wire up `DELETE /api/projects/:id` endpoint
- [ ] Cascade soft-delete to tasks? Or block if tasks exist?
- [ ] Show toast on success

---

## 🎭 Phase 5: Drag-and-Drop Kanban

### dnd-kit Setup
- [ ] Wrap KanbanView columns in DndContext
- [ ] Make task cards draggable with useDraggable
- [ ] Make columns droppable with useDroppable
- [ ] Handle onDragEnd to update task status
- [ ] Add drag overlay with DragOverlay component
- [ ] Show optimistic update during drag
- [ ] Call mutation on drop

### UX Polish
- [ ] Add drag cursor styles
- [ ] Add drop zone highlighting
- [ ] Add animation for card return on failed drop
- [ ] Keep existing quick-move buttons as fallback

---

## 💎 Phase 6: Polish & Refinements

### Dynamic Team Utilization
- [ ] Remove static utilization badges from TeamView
- [ ] Calculate live from active task count
- [ ] Update color/label dynamically

### Activity Timeline Improvements
- [ ] Auto-generate activity for all mutations
- [ ] Add filter by user/project in AnalyticsView
- [ ] Add pagination (load more button)

### Search Improvements
- [ ] Add tag search to CommandMenu
- [ ] Add date range filter
- [ ] Add "recent items" when query is empty

### Accessibility
- [ ] Add aria-labels to all interactive elements
- [ ] Ensure keyboard navigation works in modals
- [ ] Test with screen reader
- [ ] Add focus trapping in modals

---

## 🧪 Phase 7: Testing (Future)

- [ ] Add Vitest setup
- [ ] Write unit tests for utility functions
- [ ] Add React Testing Library tests for components
- [ ] Add E2E tests with Playwright
- [ ] Add CI/CD pipeline

---

## 📝 Notes

- Keep backward compatibility with in-memory fallback mode
- Test all changes locally before deploying
- Update .env.example with any new required vars
- Document breaking changes in commit messages
- Run `npm run build` before each commit to catch TS errors

---

## 🎯 Priority Order

1. **Security** (JWT secret, rate limiting) - prevents attacks
2. **Toast notifications** - makes every action feel responsive
3. **React Query** - fixes data management root issues
4. **Edit/Delete** - biggest daily UX gap
5. **Drag-and-drop** - biggest visual upgrade
6. **Dynamic utilization** - removes stale data

Estimated total implementation time: 8-12 hours
