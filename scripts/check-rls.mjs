import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const TREE = '877a9df8-473e-4251-9239-e6daaac956b7'
const USER_ID = '41369f7b-d99c-4b9d-b41e-3d108b592fea'

// Admin client - bypasses RLS
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Anon client - subject to RLS (simulates logged-out user)
const anon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('=== Testing with service role (bypasses RLS) ===')
const { count: adminCount, error: adminErr } = await admin
  .from('person')
  .select('*', { count: 'exact', head: true })
  .eq('tree_id', TREE)
console.log('person count (admin):', adminCount, '| error:', adminErr?.message ?? 'none')

const { count: pcCount } = await admin
  .from('parent_child')
  .select('*', { count: 'exact', head: true })
  .eq('tree_id', TREE)
console.log('parent_child count (admin):', pcCount)

const { count: psCount } = await admin
  .from('partnership')
  .select('*', { count: 'exact', head: true })
  .eq('tree_id', TREE)
console.log('partnership count (admin):', psCount)

console.log('\n=== Testing with anon key (subject to RLS) ===')
const { count: anonCount, error: anonErr } = await anon
  .from('person')
  .select('*', { count: 'exact', head: true })
  .eq('tree_id', TREE)
console.log('person count (anon):', anonCount, '| error:', anonErr?.message ?? 'none')

console.log('\n=== Checking RLS policies exist ===')
const { data: rlsPolicies, error: rlsErr } = await admin
  .from('pg_policies')
  .select('tablename, policyname, cmd')
  .in('tablename', ['person', 'tree_member', 'tree', 'parent_child', 'partnership'])

if (rlsErr) {
  console.log('Cannot read pg_policies:', rlsErr.message)
  console.log('→ RLS policies may not be set up at all!')
} else {
  console.log('Policies found:', rlsPolicies?.length ?? 0)
  rlsPolicies?.forEach(p => console.log(` - ${p.tablename}: ${p.policyname} (${p.cmd})`))
}
