-- Family Tree MVP: Core Schema
-- Tables: tree, tree_member, person, parent_child, partnership

-- Tree table: represents a family tree tenant
CREATE TABLE tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tree_created_at ON tree(created_at);

-- Tree member table: tracks user access to trees (owner, editor, viewer)
CREATE TABLE tree_member (
  tree_id UUID NOT NULL REFERENCES tree(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tree_id, user_id)
);

CREATE INDEX idx_tree_member_user_id ON tree_member(user_id);
CREATE INDEX idx_tree_member_tree_id ON tree_member(tree_id);

-- Person table: stores individual family members
CREATE TABLE person (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES tree(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  birth_date DATE,
  death_date DATE,
  is_alive BOOLEAN NOT NULL DEFAULT TRUE,
  city TEXT,
  country TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: birth date must be before death date
  CONSTRAINT birth_before_death CHECK (birth_date IS NULL OR death_date IS NULL OR birth_date <= death_date)
);

-- Indexes for efficient queries on person table
CREATE INDEX idx_person_tree_id ON person(tree_id);
CREATE INDEX idx_person_full_name ON person(tree_id, full_name);
CREATE INDEX idx_person_city ON person(tree_id, city) WHERE city IS NOT NULL;
CREATE INDEX idx_person_country ON person(tree_id, country) WHERE country IS NOT NULL;
CREATE INDEX idx_person_is_alive ON person(tree_id, is_alive);
CREATE INDEX idx_person_birth_date ON person(tree_id, birth_date) WHERE birth_date IS NOT NULL;
CREATE INDEX idx_person_created_at ON person(tree_id, created_at);

-- Parent-child relationship table: tracks parent-child relationships
CREATE TABLE parent_child (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES tree(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('biological', 'adopted', 'step')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT no_self_parent CHECK (parent_id != child_id),
  CONSTRAINT unique_parent_child UNIQUE (parent_id, child_id)
);

-- Indexes for relationship queries
CREATE INDEX idx_parent_child_tree_id ON parent_child(tree_id);
CREATE INDEX idx_parent_child_parent_id ON parent_child(parent_id);
CREATE INDEX idx_parent_child_child_id ON parent_child(child_id);

-- Trigger function: enforce max 2 parents per person
CREATE OR REPLACE FUNCTION check_max_parents()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM parent_child WHERE child_id = NEW.child_id AND tree_id = NEW.tree_id) >= 2 THEN
    RAISE EXCEPTION 'A person cannot have more than 2 parents';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_parents
  BEFORE INSERT ON parent_child
  FOR EACH ROW
  EXECUTE FUNCTION check_max_parents();

-- Partnership table: tracks partnerships (marriages, civil unions, etc.)
CREATE TABLE partnership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID NOT NULL REFERENCES tree(id) ON DELETE CASCADE,
  partner1_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  partner2_id UUID NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT no_self_partnership CHECK (partner1_id != partner2_id),
  CONSTRAINT unique_partnership UNIQUE (partner1_id, partner2_id),
  CONSTRAINT start_before_end CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

-- Indexes for relationship queries
CREATE INDEX idx_partnership_tree_id ON partnership(tree_id);
CREATE INDEX idx_partnership_partner1_id ON partnership(partner1_id);
CREATE INDEX idx_partnership_partner2_id ON partnership(partner2_id);
