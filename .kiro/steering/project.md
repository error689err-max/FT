Family Tree SaaS

- Stack: Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase (Postgres + Auth), React Flow, Vitest.
- Multi-tenant: every table has tree_id; every query is scoped to the user's tree. Use Supabase RLS.
- Store only primitive facts: person, parent_child, partnership. Derive all relationships (cousin, uncle, etc.) in code, never store them.
- Keep business logic in /lib (pure functions, unit tested). API route handlers stay thin.
- UI: clean, modern, mobile-friendly, light/dark mode, empty/loading/error states on every screen.
- Ask before adding new dependencies. Keep files small. No placeholder TODOs.
- 

- Skip optional tasks marked with * (property-based tests) unless explicitly asked.
- After each task group, stop and wait for user confirmation before proceeding.
- Never run database migrations automatically; output SQL files only.
