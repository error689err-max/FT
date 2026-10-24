# Seed Script Guide

This guide explains how to populate your family tree with test data.

## Prerequisites

1. **Supabase account** - Create one at https://supabase.com
2. **Environment variables** - Set up `.env.local` with your Supabase credentials
3. **Authenticated user** - Sign up or sign in to your app first

## Quick Start

Run the seed script to populate test data:

```bash
npm run seed
```

This will:
- Create a new family tree called "Test Family"
- Create tree membership for your user
- Insert 10 test people across 4 generations
- Create parent-child relationships
- Create partnerships (spouses)

## Manual Seed (SQL)

If you prefer to run SQL directly:

1. Go to Supabase dashboard → SQL Editor
2. Open `scripts/seed-test-data.sql`
3. Replace placeholders with your actual values:
   - `tree-id-placeholder` → your tree ID
   - `person-id-X` → actual person IDs
   - `auth-user-id-placeholder` → your user ID
4. Run the SQL

## After Seeding

1. Navigate to `/dashboard` to see your tree
2. Go to `/people` to view all people
3. Try `/tree` for the interactive visualization
4. Test `/related` by selecting two people

## Reset and Re-seed

To start over:

1. Delete all data in Supabase:
   ```sql
   DELETE FROM partnership;
   DELETE FROM parent_child;
   DELETE FROM person;
   DELETE FROM tree_member;
   DELETE FROM tree;
   ```

2. Run seed again:
   ```bash
   npm run seed
   ```

## Test Data Overview

### People (10 total)
- **Generation 1**: John Smith (1940-2010), Mary Smith (b. 1942)
- **Generation 2**: Robert Smith (b. 1965), Lisa Johnson (b. 1968)
- **Generation 3**: Michael Smith (b. 1990), Sarah Smith (b. 1992)
- **Generation 4**: Emma Smith (b. 2020), James Smith (b. 2022)
- **Extended**: William Smith (b. 1970), Jennifer Williams (b. 1975)

### Relationships
- 12 parent-child relationships
- 3 partnerships (spouses)

## Troubleshooting

### Error: "Not authenticated"
- Sign in to your app first at `/login`

### Error: "Missing environment variables"
- Create `.env.local` with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```

### Error: "tree_member" constraint violation
- You already have a tree. Delete it first or use a different user.
