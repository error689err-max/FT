import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'
import { getPersonById } from '@/lib/db/queries'
import type { Database } from '@/types/database'

type TreeMemberRow = Database['public']['Tables']['tree_member']['Row']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tree
    const { data: treeMember, error: treeError } = await supabase
      .from('tree_member')
      .select('tree_id')
      .eq('user_id', user.id)
      .single() as { data: TreeMemberRow | null; error: any }

    if (treeError || !treeMember) {
      return NextResponse.json({ error: 'No tree found for user' }, { status: 404 })
    }

    const member = treeMember

    // Parse request body
    const body = await request.json()
    const { person1Id, person2Id } = body

    if (!person1Id || !person2Id) {
      return NextResponse.json(
        { error: 'person1Id and person2Id are required' },
        { status: 400 }
      )
    }

    // Fetch both people
    const [person1, person2] = await Promise.all([
      getPersonById(supabase, member.tree_id, person1Id),
      getPersonById(supabase, member.tree_id, person2Id),
    ])

    if (!person1 || !person2) {
      return NextResponse.json({ error: 'One or both people not found' }, { status: 404 })
    }

    // For now, return a simple message
    // TODO: Implement full relationship calculation using computeRelationship
    return NextResponse.json({
      relationship: 'Relation being calculated',
      person1: { id: person1.id, name: person1.full_name },
      person2: { id: person2.id, name: person2.full_name },
    })
  } catch (error) {
    console.error('Error analyzing relationship:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
