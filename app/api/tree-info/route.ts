import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type TreeRow = Database['public']['Tables']['tree']['Row']
type TreeMemberRow = Database['public']['Tables']['tree_member']['Row']

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerClientInstance()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tree membership
    const { data: treeMember, error: memberError } = await supabase
      .from('tree_member')
      .select('tree_id, role')
      .eq('user_id', user.id)
      .single() as { data: TreeMemberRow | null; error: any }

    if (memberError || !treeMember) {
      return NextResponse.json({ error: 'No tree found for user' }, { status: 404 })
    }

    // Get tree details
    const { data: tree, error: treeError } = await supabase
      .from('tree')
      .select('*')
      .eq('id', treeMember.tree_id)
      .single() as { data: TreeRow | null; error: any }

    if (treeError || !tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 })
    }

    return NextResponse.json({
      tree,
      treeMember,
    })
  } catch (error) {
    console.error('Error fetching tree info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's tree membership
    const { data: treeMember, error: memberError } = await supabase
      .from('tree_member')
      .select('tree_id, role')
      .eq('user_id', user.id)
      .single() as { data: TreeMemberRow | null; error: any }

    if (memberError || !treeMember) {
      return NextResponse.json({ error: 'No tree found for user' }, { status: 404 })
    }

    // Only owner can update tree settings
    if (treeMember.role !== 'owner') {
      return NextResponse.json({ error: 'Only tree owner can update settings' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Update tree
    const { data: updatedTree, error: updateError } = await (supabase.from('tree') as any)
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', treeMember.tree_id)
      .select()
      .single() as { data: TreeRow | null; error: any }

    if (updateError) {
      console.error('Error updating tree:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tree' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tree: updatedTree,
      treeMember,
    })
  } catch (error) {
    console.error('Error updating tree info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
