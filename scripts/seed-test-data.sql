-- Seed script for test data
-- This script populates your family tree with sample data
-- Run this after creating your first tree record

-- Step 1: Insert a test tree (replace 'your-tree-id' with actual tree_id from your 'tree' table)
-- If you don't have a tree yet, run this first:
INSERT INTO tree (name, description, created_by)
VALUES ('Test Family Tree', 'A tree with sample data for testing', 'auth-user-id-placeholder')
RETURNING id;

-- Step 2: Insert sample people
-- Use the tree_id from step 1
INSERT INTO person (tree_id, full_name, gender, birth_date, death_date, is_alive, city, country, notes)
VALUES
  -- Generation 1: Grandparents
  (tree-id-placeholder, 'John Smith', 'male', '1940-01-15', '2010-03-20', false, 'New York', 'USA', 'Retired teacher'),
  (tree-id-placeholder, 'Mary Smith', 'female', '1942-05-22', NULL, true, 'Boston', 'USA', 'Loves gardening'),
  
  -- Generation 2: Parents
  (tree-id-placeholder, 'Robert Smith', 'male', '1965-08-10', NULL, true, 'Chicago', 'USA', 'Software developer'),
  (tree-id-placeholder, 'Lisa Johnson', 'female', '1968-11-30', NULL, true, 'Chicago', 'USA', 'Doctor'),
  
  -- Generation 3: User and siblings
  (tree-id-placeholder, 'Michael Smith', 'male', '1990-04-12', NULL, true, 'Seattle', 'USA', 'Engineer'),
  (tree-id-placeholder, 'Sarah Smith', 'female', '1992-07-25', NULL, true, 'Denver', 'USA', 'Designer'),
  
  -- Generation 4: Children (if applicable)
  (tree-id-placeholder, 'Emma Smith', 'female', '2020-02-14', NULL, true, 'Seattle', 'USA', 'Toddler'),
  (tree-id-placeholder, 'James Smith', 'male', '2022-06-01', NULL, true, 'Seattle', 'USA', 'Baby'),
  
  -- Extended family
  (tree-id-placeholder, 'William Smith', 'male', '1970-03-18', NULL, true, 'Austin', 'USA', 'Lawyer'),
  (tree-id-placeholder, 'Jennifer Williams', 'female', '1975-09-05', NULL, true, 'Miami', 'USA', 'Artist');

-- Step 3: Create parent-child relationships
INSERT INTO parent_child (tree_id, parent_id, child_id, relationship_type)
VALUES
  -- Grandparents -> Parents
  (tree-id-placeholder, 'person-id-1', 'person-id-3', 'biological'),  -- John -> Robert
  (tree-id-placeholder, 'person-id-2', 'person-id-3', 'biological'),  -- Mary -> Robert
  (tree-id-placeholder, 'person-id-1', 'person-id-4', 'biological'),  -- John -> Lisa (assuming Lisa is their daughter)
  (tree-id-placeholder, 'person-id-2', 'person-id-4', 'biological'),  -- Mary -> Lisa
  
  -- Parents -> Children
  (tree-id-placeholder, 'person-id-3', 'person-id-5', 'biological'),  -- Robert -> Michael
  (tree-id-placeholder, 'person-id-3', 'person-id-6', 'biological'),  -- Robert -> Sarah
  (tree-id-placeholder, 'person-id-4', 'person-id-5', 'biological'),  -- Lisa -> Michael
  (tree-id-placeholder, 'person-id-4', 'person-id-6', 'biological'),  -- Lisa -> Sarah
  
  -- Michael -> Children
  (tree-id-placeholder, 'person-id-5', 'person-id-7', 'biological'),  -- Michael -> Emma
  (tree-id-placeholder, 'person-id-5', 'person-id-8', 'biological'),  -- Michael -> James
  (tree-id-placeholder, 'person-id-6', 'person-id-7', 'biological'),  -- Sarah -> Emma
  (tree-id-placeholder, 'person-id-6', 'person-id-8', 'biological'),  -- Sarah -> James
  (tree-id-placeholder, 'person-id-3', 'person-id-9', 'biological'),  -- Robert -> William (brother)
  (tree-id-placeholder, 'person-id-3', 'person-id-10', 'biological'); -- Robert -> Jennifer (sister)

-- Step 4: Create partnerships (spouses)
INSERT INTO partnership (tree_id, person_id, partner_id, start_date, partnership_type)
VALUES
  -- Grandparents
  (tree-id-placeholder, 'person-id-1', 'person-id-2', '1965-06-15', 'marriage'),
  
  -- Parents
  (tree-id-placeholder, 'person-id-3', 'person-id-4', '1990-08-20', 'marriage'),
  
  -- Michael (married)
  (tree-id-placeholder, 'person-id-5', 'person-id-7', '2020-02-14', 'marriage');  -- Start date is child birth date for simplicity

-- Notes:
-- 1. Replace 'tree-id-placeholder' with your actual tree_id
-- 2. Replace 'person-id-X' with actual person IDs returned from the insert
-- 3. Replace 'auth-user-id-placeholder' with your actual user ID from Supabase auth
-- 4. You can find your user ID by running: SELECT id FROM auth.users LIMIT 1;

-- To get the actual IDs after inserting, run:
-- SELECT id, full_name FROM person WHERE tree_id = 'your-tree-id';
