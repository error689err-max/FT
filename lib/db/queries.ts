import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Get all people in a tree, optionally filtered by search/filter criteria
 */
export async function getPeopleByTree(
  supabase: SupabaseClient<Database>,
  treeId: string,
  options?: {
    search?: string
    gender?: string
    isAlive?: boolean
    city?: string
    country?: string
  }
) {
  let query = supabase
    .from('person')
    .select('*')
    .eq('tree_id', treeId)

  if (options?.search) {
    query = query.ilike('full_name', `%${options.search}%`)
  }

  if (options?.gender) {
    query = query.eq('gender', options.gender)
  }

  if (options?.isAlive !== undefined) {
    query = query.eq('is_alive', options.isAlive)
  }

  if (options?.city) {
    query = query.eq('city', options.city)
  }

  if (options?.country) {
    query = query.eq('country', options.country)
  }

  query = query.order('full_name', { ascending: true })

  const { data, error } = await query

  if (error) throw error
  return data as Database['public']['Tables']['person']['Row'][]
}

/**
 * Get a single person by ID, scoped to tree
 */
export async function getPersonById(
  supabase: SupabaseClient<Database>,
  treeId: string,
  personId: string
) {
  const { data, error } = await supabase
    .from('person')
    .select('*')
    .eq('tree_id', treeId)
    .eq('id', personId)
    .single()

  if (error) throw error
  return data as Database['public']['Tables']['person']['Row']
}

/**
 * Get parents of a child, including relationship type
 */
export async function getParentsByChild(
  supabase: SupabaseClient<Database>,
  treeId: string,
  childId: string
) {
  const { data, error } = await supabase
    .from('parent_child')
    .select('parent_id, relationship_type')
    .eq('tree_id', treeId)
    .eq('child_id', childId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Array<{
    parent_id: string
    relationship_type: 'biological' | 'adopted' | 'step'
  }>
}

/**
 * Get partners of a person
 */
export async function getPartnersByPerson(
  supabase: SupabaseClient<Database>,
  treeId: string,
  personId: string
) {
  const { data, error } = await supabase
    .from('partnership')
    .select('partner1_id, partner2_id, start_date, end_date')
    .eq('tree_id', treeId)
    .or(`partner1_id.eq.${personId},partner2_id.eq.${personId}`)

  if (error) throw error
  return data as Array<{
    partner1_id: string
    partner2_id: string
    start_date: string | null
    end_date: string | null
  }>
}

/**
 * Get children of a parent, including relationship type
 */
export async function getChildrenByParent(
  supabase: SupabaseClient<Database>,
  treeId: string,
  parentId: string
) {
  const { data, error } = await supabase
    .from('parent_child')
    .select('child_id, relationship_type')
    .eq('tree_id', treeId)
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Array<{
    child_id: string
    relationship_type: 'biological' | 'adopted' | 'step'
  }>
}

/**
 * Get all parent-child relationships in a tree
 */
export async function getAllParentChildRelationships(
  supabase: SupabaseClient<Database>,
  treeId: string
) {
  const { data, error } = await supabase
    .from('parent_child')
    .select('parent_id, child_id, relationship_type')
    .eq('tree_id', treeId)

  if (error) throw error
  return data as Array<{
    parent_id: string
    child_id: string
    relationship_type: 'biological' | 'adopted' | 'step'
  }>
}

/**
 * Get all partnerships in a tree
 */
export async function getAllPartnerships(
  supabase: SupabaseClient<Database>,
  treeId: string
) {
  const { data, error } = await supabase
    .from('partnership')
    .select('partner1_id, partner2_id, start_date, end_date')
    .eq('tree_id', treeId)

  if (error) throw error
  return data as Array<{
    partner1_id: string
    partner2_id: string
    start_date: string | null
    end_date: string | null
  }>
}

/**
 * Get statistics for a tree
 */
export async function getTreeStatistics(
  supabase: SupabaseClient<Database>,
  treeId: string
) {
  // Total members
  const { count: totalCount, error: totalError } = await supabase
    .from('person')
    .select('id', { count: 'exact', head: true })
    .eq('tree_id', treeId)

  if (totalError) throw totalError

  // Alive count
  const { count: aliveCount, error: aliveError } = await supabase
    .from('person')
    .select('id', { count: 'exact', head: true })
    .eq('tree_id', treeId)
    .eq('is_alive', true)

  if (aliveError) throw aliveError

  // Deceased count
  const { count: deceasedCount, error: deceasedError } = await supabase
    .from('person')
    .select('id', { count: 'exact', head: true })
    .eq('tree_id', treeId)
    .eq('is_alive', false)

  if (deceasedError) throw deceasedError

  // Oldest ancestor (earliest birth_date)
  const { data: oldestData, error: oldestError } = await supabase
    .from('person')
    .select('id, full_name, birth_date')
    .eq('tree_id', treeId)
    .not('birth_date', 'is', null)
    .order('birth_date', { ascending: true })
    .limit(1)
    .single()

  if (oldestError && oldestError.code !== 'PGRST116') throw oldestError

  // Recent additions (last 10)
  const { data: recentData, error: recentError } = await supabase
    .from('person')
    .select('id, full_name, created_at')
    .eq('tree_id', treeId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (recentError) throw recentError

  return {
    totalCount,
    aliveCount,
    deceasedCount,
    oldestAncestor: oldestData as Database['public']['Tables']['person']['Row'] | null,
    recentAdditions: recentData as Database['public']['Tables']['person']['Row'][],
  }
}
