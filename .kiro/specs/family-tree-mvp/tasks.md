# Implementation Plan: Family Tree MVP

## Overview

Full implementation of the Family Tree SaaS MVP using Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase (Postgres + Auth), React Flow, and Vitest. Tasks are ordered by dependency, with each phase building on the previous. Business logic lives in `/lib` as pure functions; API routes and page components stay thin.

---

## Tasks

- [ ] 1. Project setup and configuration
  - [ ] 1.1 Initialize Next.js project with App Router, TypeScript strict mode, and Tailwind CSS
    - Run `create-next-app` with `--typescript`, `--app`, `--tailwind` flags
    - Verify `tsconfig.json` has `"strict": true`
    - Verify `next.config.ts` is generated without errors
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 1.2 Install and configure shadcn/ui, Supabase client, Vitest, and React Flow
    - Initialize shadcn/ui (`npx shadcn-ui@latest init`)
    - Install `@supabase/supabase-js`, `@supabase/ssr`
    - Install `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Install `reactflow`
    - Install `fast-check` for property-based tests
    - Configure `vitest.config.ts` with jsdom environment and path aliases
    - Add `.env.local` template with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - _Requirements: 1.4, 1.5, 1.6, 1.7_

  - [ ]* 1.3 Verify build succeeds with zero TypeScript errors
    - Run `next build` and confirm no type errors
    - Run `vitest --run` and confirm test runner initializes
    - _Requirements: 1.8, 1.9_

- [ ] 2. TypeScript type definitions
  - [ ] 2.1 Create database types in `types/database.ts`
    - Define the full `Database` interface matching the schema: `tree`, `tree_member`, `person`, `parent_child`, `partnership`
    - Include `Row`, `Insert`, `Update` sub-types for each table
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ] 2.2 Create domain types in `types/person.ts`
    - Define `Person`, `Gender`, `RelationshipType`, `PersonWithRelationships`
    - Define `PersonParent`, `PersonPartner`, `PersonChild`, `PersonSibling`
    - Define `PersonInput` and `PersonFilters`
    - _Requirements: 8.11, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12, 9.13_

  - [ ] 2.3 Create relationship types in `types/relationship.ts`
    - Define `ComputedRelationship` union type, `RelationshipLabel`, `RelationshipPath`
    - Define `CousinRelationship` and `FamilyGraph`
    - _Requirements: 9.15–9.26, 11.12–11.26_

- [ ] 3. Supabase client and middleware setup
  - [ ] 3.1 Create Supabase browser client in `lib/supabase/client.ts`
    - Export `createBrowserClient()` using `@supabase/ssr`
    - Typed with the `Database` interface
    - _Requirements: 1.5_

  - [ ] 3.2 Create Supabase server client in `lib/supabase/server.ts`
    - Export `createServerClient()` using `@supabase/ssr` with cookie handling
    - Typed with the `Database` interface
    - _Requirements: 1.5_

  - [ ] 3.3 Create auth middleware in `middleware.ts` and `lib/supabase/middleware.ts`
    - Implement session refresh logic using `updateSession`
    - Define matcher to protect all routes under `/(protected)`
    - Redirect unauthenticated visitors to `/login`
    - Preserve the originally requested URL as a query param for post-login redirect
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [ ] 4. Database schema SQL migration
  - [ ] 4.1 Create migration file `supabase/migrations/001_schema.sql` with all table definitions
    - Create `tree`, `tree_member`, `person`, `parent_child`, `partnership` tables with all columns, constraints, indexes
    - Include `check_max_parents` trigger on `parent_child`
    - _Requirements: 16.1–16.6, 8.24, 8.14_

  - [ ] 4.2 Create migration file `supabase/migrations/002_rls.sql` with all RLS policies
    - Enable RLS on all five tables
    - Implement `has_tree_access` and `get_user_role` helper functions
    - Add all SELECT/INSERT/UPDATE/DELETE policies as defined in the design
    - _Requirements: 16.8–16.19_

  - [ ] 4.3 Create migration file `supabase/migrations/003_signup_trigger.sql`
    - Create a `handle_new_user` function that fires on `auth.users` INSERT
    - Function creates a new `tree` record and inserts the user as `owner` in `tree_member`
    - _Requirements: 16.7_

- [ ] 5. Core library — validators
  - [ ] 5.1 Implement email and password validators in `lib/validators/person.ts`
    - `validateEmail(input: string): boolean` — accepts if 1–254 chars and contains `@`
    - `validatePassword(input: string): boolean` — rejects if length < 8
    - `validatePersonInput(input: PersonInput): ValidationResult` — required full_name, date ordering
    - Export typed `ValidationResult` with `valid: boolean` and `errors: string[]`
    - _Requirements: 2.2, 2.3, 8.12, 8.14_

  - [ ]* 5.2 Write property test for email validation (Property 1)
    - **Property 1: Email Validation Correctness**
    - **Validates: Requirements 2.2**
    - Use `fc.string()` to generate random inputs; assert `validateEmail` accepts iff 1–254 chars and contains `@`
    - File: `tests/property/email-validation.property.test.ts`

  - [ ]* 5.3 Write property test for password validation (Property 2)
    - **Property 2: Password Validation Correctness**
    - **Validates: Requirements 2.3**
    - Use `fc.string()` to generate random inputs; assert `validatePassword` rejects iff length < 8
    - File: `tests/property/password-validation.property.test.ts`

  - [ ]* 5.4 Write property test for birth/death date ordering (Property 3)
    - **Property 3: Birth Death Date Ordering**
    - **Validates: Requirements 8.14**
    - Use `fc.date()` pairs; assert validator rejects iff `birth_date` > `death_date`
    - File: `tests/property/date-validation.property.test.ts`

  - [ ] 5.5 Implement relationship validator in `lib/validators/relationship.ts`
    - `validateParentCount(parents: ParentRelationship[]): ValidationResult` — rejects if count > 2
    - `validateNoSelfRelationship(id1: string, id2: string): ValidationResult` — rejects if same ID
    - _Requirements: 8.24, 16.21_

  - [ ]* 5.6 Write property test for max parents constraint (Property 4)
    - **Property 4: Maximum Parents Constraint**
    - **Validates: Requirements 8.24**
    - Use `fc.array(fc.record(...))` of varying lengths; assert `validateParentCount` rejects iff count > 2
    - File: `tests/property/parent-constraint.property.test.ts`

  - [ ]* 5.7 Write property test for no self-relationships (Property 15)
    - **Property 15: No Self-Relationships**
    - **Validates: Requirements 8.24, 16.1, 16.2, 16.3**
    - Use `fc.uuid()` pairs; assert `validateNoSelfRelationship` rejects iff both IDs are equal
    - File: `tests/property/no-self-relationships.property.test.ts`

- [ ] 6. Core library — relationship calculator
  - [ ] 6.1 Implement `FamilyGraph` builder in `lib/relationships/calculator.ts`
    - `buildFamilyGraph(people: Person[], parentEdges: ParentChildRow[], partnerEdges: PartnershipRow[]): FamilyGraph`
    - Populates `nodes`, `parentEdges`, `childEdges`, `partnerEdges` maps
    - _Requirements: 9.15–9.26, 11.8–11.26_

  - [ ] 6.2 Implement sibling classification in `lib/relationships/calculator.ts`
    - `classifySiblings(personId: string, graph: FamilyGraph): PersonSibling[]`
    - Full sibling = share both parents; half sibling = share exactly one parent
    - _Requirements: 9.13, 9.14_

  - [ ]* 6.3 Write property test for sibling classification (Property 5)
    - **Property 5: Sibling Classification Correctness**
    - **Validates: Requirements 9.14**
    - Generate random parent assignments; assert full/half/no sibling determination is correct
    - File: `tests/property/sibling-classification.property.test.ts`

  - [ ] 6.4 Implement ancestor/descendant relationship computation in `lib/relationships/calculator.ts`
    - `computeRelationship(fromId: string, toId: string, graph: FamilyGraph): RelationshipLabel`
    - Handle direct parent/child, grandparent/grandchild with `great-` prefix chains
    - Handle aunt/uncle, niece/nephew, cousins with degree and removed count
    - Handle partner/spouse and not-related cases
    - _Requirements: 9.15–9.26_

  - [ ]* 6.5 Write property test for ancestor relationship calculation (Property 6)
    - **Property 6: Relationship Calculation for Direct Ancestors**
    - **Validates: Requirements 9.18, 11.13, 11.14**
    - Generate random ancestor chains of depth N; assert label uses correct `great-` prefix count
    - File: `tests/property/relationship-ancestor.property.test.ts`

  - [ ]* 6.6 Write property test for descendant relationship calculation (Property 7)
    - **Property 7: Relationship Calculation for Direct Descendants**
    - **Validates: Requirements 9.21, 11.13, 11.14**
    - Generate random descendant chains of depth N; assert label uses correct `great-` prefix count
    - File: `tests/property/relationship-descendant.property.test.ts`

  - [ ]* 6.7 Write property test for sibling relationship labels (Property 8)
    - **Property 8: Sibling Relationship Labels**
    - **Validates: Requirements 9.19, 11.15, 11.16**
    - Generate sibling pairs with gender; assert `brother`/`sister`/`half-brother`/`half-sister` labeling is correct
    - File: `tests/property/relationship-sibling.property.test.ts`

  - [ ]* 6.8 Write property test for cousin relationship calculation (Property 9)
    - **Property 9: Cousin Relationship Calculation**
    - **Validates: Requirements 9.24, 11.18–11.21**
    - Generate cousin graphs with varying N and M generation distances; assert degree = min(N,M)-1 and removed = |N-M|
    - File: `tests/property/relationship-cousin.property.test.ts`

  - [ ]* 6.9 Write property test for relationship symmetry (Property 10)
    - **Property 10: Relationship Symmetry**
    - **Validates: Requirements 9.15–9.26, 11.12–11.22**
    - Generate random family graphs; assert `computeRelationship(A,B)` and `computeRelationship(B,A)` are correct inverses
    - File: `tests/property/relationship-symmetry.property.test.ts`

- [ ] 7. Core library — path finder
  - [ ] 7.1 Implement path finder in `lib/relationships/path-finder.ts`
    - `findRelationshipPath(fromId: string, toId: string, graph: FamilyGraph): RelationshipPath`
    - BFS through the family graph to find the shortest connection
    - Return path of intermediate `Person` nodes and list of common ancestors
    - Return `relationship: { label: 'not related', type: 'not-related' }` for disconnected nodes
    - _Requirements: 11.10, 11.23, 11.26_

  - [ ]* 7.2 Write property test for path existence (Property 11)
    - **Property 11: Path Existence in Connected Components**
    - **Validates: Requirements 11.10, 11.23**
    - Generate connected and disconnected graphs; assert path exists iff nodes are in same connected component
    - File: `tests/property/relationship-path.property.test.ts`

  - [ ]* 7.3 Write property test for shortest relationship path (Property 12)
    - **Property 12: Shortest Relationship Path**
    - **Validates: Requirements 11.26**
    - Generate graphs with multiple paths; assert the returned relationship is the closest (shortest genealogical distance)
    - File: `tests/property/relationship-shortest.property.test.ts`

- [ ] 8. Core library — relationship labels
  - [ ] 8.1 Implement label generator in `lib/relationships/labels.ts`
    - `getRelationshipLabel(type: ComputedRelationship, targetGender: Gender | null, cousinData?: CousinRelationship): string`
    - Produce gender-aware labels: mother/father, son/daughter, grandmother/grandfather, brother/sister, aunt/uncle, niece/nephew, first/second/Nth cousin [once/twice removed]
    - _Requirements: 9.15–9.26, 11.12–11.22_

- [ ] 9. Checkpoint — Ensure all lib validators, calculator, path-finder, and label tests pass
  - Run `vitest --run` and confirm all tests in `tests/` pass. Ask the user if any questions arise.

- [ ] 10. Core library — tree layout engine
  - [ ] 10.1 Implement tree layout engine in `lib/tree/layout.ts`
    - `calculateLayout(graph: FamilyGraph): { nodes: FlowNode[]; edges: FlowEdge[] }`
    - Assign Y-coordinates so ancestors always have a lower Y than descendants
    - Position partners horizontally adjacent at the same Y level
    - Return React Flow–compatible `Node` and `Edge` arrays
    - Define `FlowNode` and `FlowEdge` types in `lib/tree/types.ts`
    - _Requirements: 10.7–10.12_

  - [ ]* 10.2 Write property test for ancestor layout invariant (Property 13)
    - **Property 13: Ancestor Layout Invariant**
    - **Validates: Requirements 10.8, 10.9**
    - Generate random family trees; assert every ancestor has a lower Y-coordinate than its descendants after layout
    - File: `tests/property/tree-layout-ancestor.property.test.ts`

  - [ ]* 10.3 Write property test for partnership layout invariant (Property 14)
    - **Property 14: Partnership Layout Invariant**
    - **Validates: Requirements 10.10**
    - Generate random partnerships; assert partners have Y-coordinates within a small threshold after layout
    - File: `tests/property/tree-layout-partnership.property.test.ts`

- [ ] 11. Core library — database query builders
  - [ ] 11.1 Implement reusable query builders in `lib/db/queries.ts`
    - `getPeopleByTree(supabase, treeId)` — fetches all persons scoped to tree
    - `getPersonById(supabase, treeId, personId)` — fetches a single person
    - `getParentsByChild(supabase, treeId, childId)` — fetches parent_child rows for a child
    - `getPartnersByPerson(supabase, treeId, personId)` — fetches partnerships for a person
    - `getChildrenByParent(supabase, treeId, parentId)` — fetches parent_child rows for a parent
    - All functions must scope to `treeId` and return typed results
    - _Requirements: 16.11, 16.12_

- [ ] 12. Root layout, theme provider, and providers
  - [ ] 12.1 Create `components/theme-provider.tsx`
    - Wrap children in a theme context using `next-themes` or a custom context
    - Read theme from `localStorage` on mount; default to `light` if absent
    - Persist theme changes to `localStorage`; apply theme within 100ms on toggle
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.7, 14.8_

  - [ ] 12.2 Create root `app/layout.tsx` and `app/providers.tsx`
    - Wrap app in `ThemeProvider`
    - Apply base Tailwind classes for light/dark backgrounds
    - Import and configure shadcn/ui global styles
    - _Requirements: 14.2, 14.3_

- [ ] 13. Auth layout and login page
  - [ ] 13.1 Create auth route group layout `app/(auth)/layout.tsx`
    - Minimal layout with no sidebar (centered card)
    - Redirect to `/dashboard` if user already has an active session
    - _Requirements: 4.4_

  - [ ] 13.2 Create `app/(auth)/login/page.tsx` and `app/(auth)/login/components/login-form.tsx`
    - Render email (`type="email"`) and password (`type="password"`) inputs
    - Client-side validation: email format (1–254 chars, contains `@`), password length ≥ 8
    - Display inline field-level error messages on validation failure
    - Submit to Supabase `signInWithPassword`; display server errors within 2 seconds
    - Show 30-second timeout error if auth takes too long
    - Loading indicator within 200ms on submit
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 13.1, 13.2_

  - [ ] 13.3 Add sign-up flow to the login form
    - Toggle between sign-in and sign-up modes on the same page
    - On sign-up, call Supabase `signUp`; handle duplicate email error
    - _Requirements: 2.4, 2.5_

  - [ ] 13.4 Add Google OAuth button to login form
    - Render "Sign in with Google" button
    - On click, call `signInWithOAuth({ provider: 'google' })`
    - Handle OAuth cancellation (return to login without error)
    - Handle OAuth failure (display "OAuth provider unavailable" error)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 13.5 Create OAuth callback handler `app/api/auth/callback/route.ts`
    - Exchange the auth code for a session using `exchangeCodeForSession`
    - Redirect to `/dashboard` (or originally requested URL) on success
    - Redirect to `/login?error=oauth_failed` on failure
    - _Requirements: 3.3, 3.4, 3.5, 5.5_

  - [ ] 13.6 Create logout route handler `app/api/auth/logout/route.ts`
    - Call `supabase.auth.signOut()`
    - Redirect to landing page `/`
    - _Requirements: 2.9, 6.10_

- [ ] 14. Landing page
  - [ ] 14.1 Create `app/page.tsx` (public landing page)
    - Display app description and feature highlights
    - Render call-to-action button linking to `/login`
    - Show error state with retry button if page fails to load
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 15. Protected route group — layout and sidebar
  - [ ] 15.1 Create protected group layout `app/(protected)/layout.tsx`
    - Use server component to fetch the authenticated user
    - Pass user to `Sidebar` component
    - Render sidebar + main content area
    - _Requirements: 5.2, 6.1_

  - [ ] 15.2 Create `app/(protected)/components/sidebar.tsx`
    - Navigation links: Dashboard (`/dashboard`), People (`/people`), Tree View (`/tree`), How Are We Related (`/related`), Stats (`/stats`)
    - Display current user's email address
    - Logout button that calls `POST /api/auth/logout`
    - Highlight active link using `usePathname()`
    - Theme toggle control (calls `ThemeProvider` toggle)
    - Apply light/dark theme-consistent colors
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.9, 14.6_

  - [ ] 15.3 Add responsive mobile behavior to sidebar
    - Hide sidebar by default when viewport < 768px
    - Render hamburger menu button that toggles sidebar visibility
    - _Requirements: 6.7, 6.8, 15.6, 15.7_

- [ ] 16. Dashboard page
  - [ ] 16.1 Create `app/(protected)/dashboard/page.tsx`
    - Display welcome message containing the authenticated user's email
    - Display a message noting that full data features are coming
    - Use protected layout with sidebar
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 17. People list page
  - [ ] 17.1 Create people API routes `app/api/people/route.ts` (GET list, POST create)
    - GET: fetch all people for the user's tree, support `search`, `gender`, `isAlive`, `city`, `country` query params
    - POST: validate `PersonInput`, insert into `person` table with user's `tree_id`
    - Return consistent `{ error }` shape on failures with appropriate HTTP status codes
    - _Requirements: 8.4, 8.8, 8.17, 16.11, 16.13_

  - [ ] 17.2 Create person detail API route `app/api/people/[id]/route.ts` (GET, PATCH, DELETE)
    - GET: fetch single person scoped to user's tree
    - PATCH: validate and apply partial updates
    - DELETE: check for existing relationships; return 409 if any exist
    - _Requirements: 8.20, 8.21, 8.22_

  - [ ] 17.3 Create `app/(protected)/people/components/search-filter.tsx`
    - Search input with 300ms debounce filtering by `full_name` (case-insensitive)
    - Filter dropdowns: gender, is_alive status, city, country
    - Emit `onSearchChange` and `onFilterChange` callbacks
    - _Requirements: 8.5, 8.6, 8.7, 8.8_

  - [ ] 17.4 Create `app/(protected)/people/components/person-table.tsx`
    - Display people in a sortable table (full_name, birth_date, city, country columns)
    - Inline Edit and Delete action buttons per row
    - Loading state (spinner within 200ms), empty state ("No people in your tree yet")
    - _Requirements: 8.4, 8.9, 8.18, 8.27, 8.28_

  - [ ] 17.5 Create `app/(protected)/people/components/parent-selector.tsx`
    - Dropdown to select up to 2 parents from existing people
    - Each parent entry has a relationship type selector (biological, adopted, step)
    - Show validation error if user tries to add a third parent
    - _Requirements: 8.23, 8.24, 8.25, 8.26_

  - [ ] 17.6 Create `app/(protected)/people/components/person-form.tsx`
    - Modal dialog using shadcn/ui `Dialog`
    - Fields: `full_name` (required), `gender`, `birth_date`, `death_date`, `is_alive` (default true), `city`, `country`, `notes`
    - Include `ParentSelector` for parent relationships
    - Validation: required name, date ordering, warn if `is_alive=false` and no `death_date`, warn on duplicate name with confirmation
    - Pre-populate fields when `person` prop is provided (edit mode)
    - _Requirements: 8.10, 8.11, 8.12, 8.13, 8.14, 8.15, 8.16, 8.19_

  - [ ] 17.7 Create `app/(protected)/people/page.tsx`
    - Compose `SearchFilter`, `PersonTable`, and `PersonForm` components
    - Manage open/close state of person form modal
    - Wire up create/edit/delete handlers to API routes
    - Display success toast on create/update; error toast on failure
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 18. Person detail page
  - [ ] 18.1 Create `app/(protected)/people/[id]/page.tsx` as a server component
    - Fetch person, parents, partners, children (grouped by partner), siblings using `lib/db/queries.ts`
    - Build `FamilyGraph` and compute relationship from logged-in user to viewed person using `lib/relationships/calculator.ts`
    - Handle invalid/missing person ID with 404 error message
    - Loading state within 200ms
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ] 18.2 Render person bio and relationship sections in person detail page
    - Display full_name as page title
    - Display all fields: gender, birth_date, death_date, is_alive, city, country, notes
    - Parents section: name + relationship type + link to detail page
    - Partners section: name + link
    - Children section: name + relationship type + link, grouped by partner
    - Siblings section: name + full/half indicator + link
    - Computed relationship label ("your grandmother", "not related", "This is you", etc.)
    - Empty section messages when no data
    - Edit button opens `PersonForm` modal
    - _Requirements: 9.5–9.28_

- [ ] 19. Checkpoint — Ensure all pages through person detail render and API routes respond correctly
  - Run `vitest --run`. Verify no TypeScript errors with `tsc --noEmit`. Ask the user if any questions arise.

- [ ] 20. Tree view page
  - [ ] 20.1 Create custom React Flow node `app/(protected)/tree/components/person-node.tsx`
    - Display `full_name`
    - Apply distinct visual indicator (e.g., dashed border or opacity) for deceased persons
    - Handle click to navigate to `/people/[id]`
    - _Requirements: 10.14, 10.15_

  - [ ] 20.2 Create `app/(protected)/tree/page.tsx`
    - Client component that fetches all people + relationships via `lib/db/queries.ts`
    - Call `calculateLayout` from `lib/tree/layout.ts` to produce nodes and edges
    - Render with React Flow, wiring in `PersonNode` as custom node type
    - Display parent→child edges and partner↔partner edges
    - Zoom controls, pan controls; auto zoom-out for trees with > 50 people
    - Loading indicator within 200ms; error state with retry button; empty state with link to `/people`
    - _Requirements: 10.1–10.20_

- [ ] 21. Relationship analysis page
  - [ ] 21.1 Create `app/(protected)/related/page.tsx`
    - Two searchable person picker dropdowns ("Person 1", "Person 2")
    - Filter by name (case-insensitive) as user types
    - On selecting two different people: call `findRelationshipPath` from `lib/relationships/path-finder.ts`
    - Display relationship label, path of intermediate people, and common ancestors
    - Guard: same person in both pickers → "Please select two different people"
    - Guard: fewer than two selected → prompt to select two people
    - Loading indicator within 200ms while computing
    - _Requirements: 11.1–11.27_

- [ ] 22. Stats page
  - [ ] 22.1 Create `app/(protected)/stats/page.tsx`
    - Server component: query aggregated stats from `person` table scoped to user's tree
    - Total Members card, Alive card, Deceased card
    - By Country card (top 5, name + count)
    - By City card (top 5, name + count)
    - Oldest Ancestor card (earliest `birth_date`; "No birth dates recorded" fallback)
    - Recent Additions card (last 10 by `created_at` desc, relative timestamps)
    - Loading indicator within 200ms; empty state with link to `/people`
    - _Requirements: 12.1–12.23_

- [ ] 23. Unit tests for /lib pure functions
  - [ ]* 23.1 Write unit tests for validators in `tests/unit/lib/validators/person.test.ts`
    - Test `validateEmail`: known valid and invalid examples (empty string, no `@`, 255-char string)
    - Test `validatePassword`: exactly 7 chars (fail), exactly 8 chars (pass), empty (fail)
    - Test `validatePersonInput`: missing full_name, birth > death date
    - _Requirements: 2.2, 2.3, 8.12, 8.14_

  - [ ]* 23.2 Write unit tests for relationship validator in `tests/unit/lib/validators/relationship.test.ts`
    - Test `validateParentCount`: 0, 1, 2 (all pass), 3 (fail)
    - Test `validateNoSelfRelationship`: same ID (fail), different IDs (pass)
    - _Requirements: 8.24, 16.21_

  - [ ]* 23.3 Write unit tests for relationship calculator in `tests/unit/lib/relationships/calculator.test.ts`
    - Nuclear family (2 parents, 2 children): verify sibling, parent, child relationships
    - 3-generation chain: verify grandparent/grandchild
    - Half-siblings sharing one parent
    - Aunt/uncle relationship
    - First cousin relationship
    - Partner/spouse relationship
    - Unconnected people → not-related
    - _Requirements: 9.15–9.26_

  - [ ]* 23.4 Write unit tests for path finder in `tests/unit/lib/relationships/path-finder.test.ts`
    - Direct parent-child: path length = 1
    - Two people with no connection: path = null / not-related
    - Two people with multiple paths: returns shortest
    - _Requirements: 11.10, 11.23, 11.26_

  - [ ]* 23.5 Write unit tests for label generator in `tests/unit/lib/relationships/labels.test.ts`
    - Verify gender-sensitive labels for each `ComputedRelationship` value
    - Verify cousin labels: "first cousin", "second cousin", "first cousin once removed"
    - _Requirements: 9.15–9.26, 11.12–11.22_

  - [ ]* 23.6 Write unit tests for tree layout engine in `tests/unit/lib/tree/layout.test.ts`
    - Single person: one node, no edges
    - Parent + child: parent Y < child Y
    - Two partners: same Y, adjacent X
    - 3-generation tree: each generation has strictly increasing Y
    - _Requirements: 10.7–10.12_

- [ ] 24. Final checkpoint — Ensure all tests pass and build is clean
  - Run `vitest --run` and confirm all tests pass (property-based included)
  - Run `tsc --noEmit` and confirm zero TypeScript errors
  - Run `next build` and confirm successful production build
  - Ask the user if any questions arise before closing out.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; they cover property-based and unit tests
- Each task references specific requirements for traceability
- Checkpoints at tasks 9, 19, and 24 provide validation gates between major phases
- Business logic in `/lib` is pure and independently testable before any UI is built
- API routes in `app/api/` are kept thin — all validation and computation delegates to `/lib`
- Property tests use `fast-check` with a minimum of 100 iterations per property

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.1"] },
    { "id": 4, "tasks": ["3.1", "3.2", "4.2", "4.3"] },
    { "id": 5, "tasks": ["3.3", "5.1", "5.5"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.6", "5.7", "6.1"] },
    { "id": 7, "tasks": ["6.2", "11.1"] },
    { "id": 8, "tasks": ["6.3", "6.4"] },
    { "id": 9, "tasks": ["6.5", "6.6", "6.7", "6.8", "7.1", "8.1"] },
    { "id": 10, "tasks": ["6.9", "7.2", "7.3"] },
    { "id": 11, "tasks": ["10.1", "12.1"] },
    { "id": 12, "tasks": ["10.2", "10.3", "12.2"] },
    { "id": 13, "tasks": ["13.1", "14.1"] },
    { "id": 14, "tasks": ["13.2"] },
    { "id": 15, "tasks": ["13.3"] },
    { "id": 16, "tasks": ["13.4", "13.5", "13.6"] },
    { "id": 17, "tasks": ["15.1"] },
    { "id": 18, "tasks": ["15.2"] },
    { "id": 19, "tasks": ["15.3", "16.1"] },
    { "id": 20, "tasks": ["17.1", "17.2"] },
    { "id": 21, "tasks": ["17.3", "17.4", "17.5"] },
    { "id": 22, "tasks": ["17.6"] },
    { "id": 23, "tasks": ["17.7"] },
    { "id": 24, "tasks": ["18.1"] },
    { "id": 25, "tasks": ["18.2"] },
    { "id": 26, "tasks": ["20.1"] },
    { "id": 27, "tasks": ["20.2", "21.1", "22.1"] },
    { "id": 28, "tasks": ["23.1", "23.2", "23.3", "23.4", "23.5", "23.6"] }
  ]
}
```
