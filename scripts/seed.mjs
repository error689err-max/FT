#!/usr/bin/env node
/**
 * Simple seed script - run this after setting up your .env.local
 * Usage: node scripts/seed.js
 * 
 * Note: You must be authenticated or provide a user_id to seed data.
 * If no user is authenticated, provide a user_id in the seed config below.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load from project root directory
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

dotenv.config({ path: join(rootDir, '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables')
  console.error('Please create .env.local with your Supabase credentials')
  console.error('See .env.example for reference')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// ====== CONFIGURATION ======
// The script will automatically use the authenticated user
// If you want to specify a different user, set USER_ID below
const USER_ID = "41369f7b-d99c-4b9d-b41e-3d108b592fea" // Leave as null to auto-detect, or set to a specific UUID
// ===========================

async function seed() {
  console.log('🚀 Starting seed...\n')

  // 1. Get authenticated user or use provided user_id
  let user = null
  if (USER_ID) {
    user = { id: USER_ID, email: 'configured-user@example.com' }
    console.log(`👤 Using configured user_id: ${user.id}\n`)
  } else {
    // List all users and use the first one
    console.log('🔍 Auto-detecting user from Supabase...')
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (!usersError && usersData && usersData.users.length > 0) {
      user = usersData.users[0]
      console.log(`✓ Found user: ${user.email}`)
      console.log(`✓ User ID: ${user.id}\n`)
    } else {
      console.error('❌ No users found. Please create a user first:')
      console.error('   1. Go to Supabase Dashboard → Authentication → Users')
      console.error('   2. Click "Add user" and create a test user')
      console.error('   3. Or sign up at http://localhost:3000/login')
      process.exit(1)
    }
  }

  console.log(`📋 Seeding data for: ${user.email}\n`)

  // 2. Check if user already has a tree
  const { data: existingTrees } = await supabase
    .from('tree')
    .select('id, name')
    .eq('created_by', user.id)
    .limit(1)

  let tree
  if (existingTrees && existingTrees.length > 0) {
    tree = existingTrees[0]
    console.log(`⚠️  Using existing tree: ${tree.name} (${tree.id})\n`)
    
    // Check if tree already has people
    const { data: existingPeople } = await supabase
      .from('person')
      .select('id')
      .eq('tree_id', tree.id)
      .limit(1)
    
    if (existingPeople && existingPeople.length > 0) {
      console.log('⚠️  Tree already has people. Skipping seed to avoid duplicates.')
      return
    }
  } else {
    // 3. Create tree
    console.log('📝 Creating tree...')
    const { data: newTree, error: treeErr } = await supabase
      .from('tree')
      .insert([{ name: 'Test Family', created_by: user.id }])
      .select()
      .single()

    if (treeErr) {
      console.error('Tree error:', treeErr)
      return
    }
    tree = newTree
    console.log(`✓ Tree: ${tree.name} (${tree.id})\n`)

    // 4. Create tree member
    console.log('👥 Creating membership...')
    const { error: memberError } = await supabase
      .from('tree_member')
      .insert([{ tree_id: tree.id, user_id: user.id, role: 'owner' }])

    if (memberError) {
      console.error('Member error:', memberError)
      return
    }
    console.log('✓ Created tree membership\n')
  }

  // 5. Insert people
  console.log('👤 Inserting 10 test people...')

  const { data: people, error: peopleError } = await supabase
    .from('person')
    .insert([
      { tree_id: tree.id, full_name: 'John Smith', gender: 'Male', birth_date: '1940-01-15', city: 'New York', country: 'USA' },
      { tree_id: tree.id, full_name: 'Mary Smith', gender: 'Female', birth_date: '1942-05-22', city: 'Boston', country: 'USA' },
      { tree_id: tree.id, full_name: 'Robert Smith', gender: 'Male', birth_date: '1965-08-10', city: 'Chicago', country: 'USA' },
      { tree_id: tree.id, full_name: 'Lisa Johnson', gender: 'Female', birth_date: '1968-11-30', city: 'Chicago', country: 'USA' },
      { tree_id: tree.id, full_name: 'Michael Smith', gender: 'Male', birth_date: '1990-04-12', city: 'Seattle', country: 'USA' },
      { tree_id: tree.id, full_name: 'Sarah Smith', gender: 'Female', birth_date: '1992-07-25', city: 'Denver', country: 'USA' },
      { tree_id: tree.id, full_name: 'Emma Smith', gender: 'Female', birth_date: '2020-02-14', city: 'Seattle', country: 'USA' },
      { tree_id: tree.id, full_name: 'James Smith', gender: 'Male', birth_date: '2022-06-01', city: 'Seattle', country: 'USA' },
      { tree_id: tree.id, full_name: 'William Smith', gender: 'Male', birth_date: '1970-03-18', city: 'Austin', country: 'USA' },
      { tree_id: tree.id, full_name: 'Jennifer Williams', gender: 'Female', birth_date: '1975-09-05', city: 'Miami', country: 'USA' },
    ])
    .select()

  if (peopleError) {
    console.error('People error:', peopleError)
    return
  }
  console.log(`✓ Inserted ${people.length} people\n`)

  // 6. Create parent-child relationships
  console.log('🔗 Creating relationships...')
  const parentChild = [
    { parent: 'John Smith', child: 'Robert Smith' },
    { parent: 'Mary Smith', child: 'Robert Smith' },
    { parent: 'John Smith', child: 'Lisa Johnson' },
    { parent: 'Mary Smith', child: 'Lisa Johnson' },
    { parent: 'Robert Smith', child: 'Michael Smith' },
    { parent: 'Robert Smith', child: 'Sarah Smith' },
    { parent: 'Lisa Johnson', child: 'Michael Smith' },
    { parent: 'Lisa Johnson', child: 'Sarah Smith' },
    { parent: 'Michael Smith', child: 'Emma Smith' },
    { parent: 'Michael Smith', child: 'James Smith' },
    { parent: 'Sarah Smith', child: 'Emma Smith' },
    { parent: 'Sarah Smith', child: 'James Smith' },
  ]

  let relCount = 0
  for (const rel of parentChild) {
    const { data: parentData } = await supabase
      .from('person')
      .select('id')
      .eq('tree_id', tree.id)
      .eq('full_name', rel.parent)
      .single()

    const { data: childData } = await supabase
      .from('person')
      .select('id')
      .eq('tree_id', tree.id)
      .eq('full_name', rel.child)
      .single()

    if (parentData && childData) {
      await supabase
        .from('parent_child')
        .insert([{ 
          tree_id: tree.id, 
          parent_id: parentData.id, 
          child_id: childData.id, 
          relationship_type: 'biological' 
        }])
      relCount++
    }
  }
  console.log(`✓ Created ${relCount} parent-child relationships\n`)

  // 7. Create partnerships
  console.log('💍 Creating partnerships...')
  const partnerships = [
    { person: 'John Smith', partner: 'Mary Smith' },
    { person: 'Robert Smith', partner: 'Lisa Johnson' },
    { person: 'Michael Smith', partner: 'Sarah Smith' },
  ]

  let partCount = 0
  for (const p of partnerships) {
    const { data: personData } = await supabase
      .from('person')
      .select('id')
      .eq('tree_id', tree.id)
      .eq('full_name', p.person)
      .single()

    const { data: partnerData } = await supabase
      .from('person')
      .select('id')
      .eq('tree_id', tree.id)
      .eq('full_name', p.partner)
      .single()

    if (personData && partnerData) {
      await supabase
        .from('partnership')
        .insert([{ 
          tree_id: tree.id, 
          partner1_id: personData.id, 
          partner2_id: partnerData.id,
          start_date: new Date().toISOString().split('T')[0]
        }])
      partCount++
    }
  }
  console.log(`✓ Created ${partCount} partnerships\n`)

  console.log('✅ Seed complete!')
  console.log('\n📊 Summary:')
  console.log(`   Tree: ${tree.name}`)
  console.log(`   People: ${people.length}`)
  console.log(`   Parent-child relationships: ${relCount}`)
  console.log(`   Partnerships: ${partCount}`)
  console.log('\n✨ You can now navigate to /dashboard in your app')
}

seed().catch(console.error)