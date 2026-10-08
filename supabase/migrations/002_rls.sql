-- Family Tree MVP: Row Level Security (RLS) Policies
-- Enforces multi-tenancy and access control at the database level

-- Helper function: check if user has access to a tree
CREATE OR REPLACE FUNCTION has_tree_access(p_tree_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tree_member
    WHERE tree_id = p_tree_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: get user's role in a tree
CREATE OR REPLACE FUNCTION get_user_role(p_tree_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM tree_member
    WHERE tree_id = p_tree_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE tree ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE person ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership ENABLE ROW LEVEL SECURITY;

-- ========== TREE TABLE POLICIES ==========

-- Users can view trees they're members of
CREATE POLICY "Users can view their trees"
  ON tree FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tree_member
      WHERE tree_member.tree_id = tree.id
      AND tree_member.user_id = auth.uid()
    )
  );

-- Only authenticated users can create trees (signup trigger handles assignment)
CREATE POLICY "Authenticated users can create trees"
  ON tree FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can update trees
CREATE POLICY "Owners can update their trees"
  ON tree FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tree_member
      WHERE tree_member.tree_id = tree.id
      AND tree_member.user_id = auth.uid()
      AND tree_member.role = 'owner'
    )
  );

-- Only owners can delete trees
CREATE POLICY "Owners can delete their trees"
  ON tree FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tree_member
      WHERE tree_member.tree_id = tree.id
      AND tree_member.user_id = auth.uid()
      AND tree_member.role = 'owner'
    )
  );

-- ========== TREE_MEMBER TABLE POLICIES ==========

-- Users can see all members of trees they belong to
CREATE POLICY "Users can view members of their trees"
  ON tree_member FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tree_member tm
      WHERE tm.tree_id = tree_member.tree_id
      AND tm.user_id = auth.uid()
    )
  );

-- Only owners can add members to a tree
CREATE POLICY "Owners can add members"
  ON tree_member FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tree_member tm
      WHERE tm.tree_id = tree_member.tree_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- Only owners can update member roles
CREATE POLICY "Owners can update member roles"
  ON tree_member FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tree_member tm
      WHERE tm.tree_id = tree_member.tree_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- Only owners can remove members
CREATE POLICY "Owners can remove members"
  ON tree_member FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tree_member tm
      WHERE tm.tree_id = tree_member.tree_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'owner'
    )
  );

-- ========== PERSON TABLE POLICIES ==========

-- Users can view people in their trees
CREATE POLICY "Users can view people in their trees"
  ON person FOR SELECT
  USING (has_tree_access(tree_id));

-- Editors and owners can create people
CREATE POLICY "Editors can create people"
  ON person FOR INSERT
  WITH CHECK (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors and owners can update people
CREATE POLICY "Editors can update people"
  ON person FOR UPDATE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors and owners can delete people
CREATE POLICY "Editors can delete people"
  ON person FOR DELETE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- ========== PARENT_CHILD TABLE POLICIES ==========

-- Users can view relationships in their trees
CREATE POLICY "Users can view relationships in their trees"
  ON parent_child FOR SELECT
  USING (has_tree_access(tree_id));

-- Editors can create relationships
CREATE POLICY "Editors can create relationships"
  ON parent_child FOR INSERT
  WITH CHECK (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors can update relationships
CREATE POLICY "Editors can update relationships"
  ON parent_child FOR UPDATE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors can delete relationships
CREATE POLICY "Editors can delete relationships"
  ON parent_child FOR DELETE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- ========== PARTNERSHIP TABLE POLICIES ==========

-- Users can view partnerships in their trees
CREATE POLICY "Users can view partnerships in their trees"
  ON partnership FOR SELECT
  USING (has_tree_access(tree_id));

-- Editors can create partnerships
CREATE POLICY "Editors can create partnerships"
  ON partnership FOR INSERT
  WITH CHECK (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors can update partnerships
CREATE POLICY "Editors can update partnerships"
  ON partnership FOR UPDATE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );

-- Editors can delete partnerships
CREATE POLICY "Editors can delete partnerships"
  ON partnership FOR DELETE
  USING (
    has_tree_access(tree_id) AND
    get_user_role(tree_id) IN ('editor', 'owner')
  );
