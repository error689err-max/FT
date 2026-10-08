# Requirements Document

## Introduction

This document defines the requirements for a multi-tenant family tree web application MVP. The system enables users to authenticate, manage family tree data, visualize relationships, and analyze connections between family members. The MVP focuses on establishing the authentication flow, navigation structure, and protected routes, while data management features will be implemented in subsequent phases.

## Glossary

- **System**: The family tree web application
- **User**: A person who has created an account and is authenticated
- **Visitor**: A person who has not yet authenticated
- **Tree**: A collection of family data belonging to a single tenant
- **Auth_Provider**: The Supabase authentication service
- **Dashboard**: The main landing page for authenticated users
- **Protected_Route**: A page that requires authentication to access
- **Session**: An authenticated user's active login state

## Requirements

### Requirement 1: Project Structure and Configuration

**User Story:** As a developer, I want a properly configured Next.js project with all necessary dependencies, so that I can build the application on a solid foundation.

#### Acceptance Criteria

1. THE System SHALL use Next.js with App Router architecture
2. THE System SHALL configure TypeScript with the strict compiler option set to true in tsconfig.json
3. THE System SHALL use Tailwind CSS for styling
4. THE System SHALL use shadcn/ui component library
5. THE System SHALL install the Supabase client library and configure it with environment variables for the Supabase URL and anonymous key
6. THE System SHALL include Vitest for testing
7. THE System SHALL include TypeScript type definitions for Next.js, React, and all installed third-party libraries that provide types
8. WHEN the project is initialized, THE System SHALL successfully execute the build command without TypeScript compilation errors
9. WHEN the project is initialized, THE System SHALL successfully start the development server

### Requirement 2: Authentication with Email

**User Story:** As a visitor, I want to sign up and log in with my email and password, so that I can access my family tree data.

#### Acceptance Criteria

1. WHEN a visitor navigates to the login page, THE System SHALL display email and password input fields with type="email" and type="password" respectively
2. WHEN a visitor submits email credentials for signup, IF the email is not between 1 and 254 characters OR does not contain an @ symbol, THEN THE System SHALL display an error message
3. WHEN a visitor submits password credentials for signup, IF the password is less than 8 characters, THEN THE System SHALL display an error message
4. WHEN a visitor submits valid email and password credentials for signup, IF an account with that email already exists, THEN THE Auth_Provider SHALL return an error and THE System SHALL display an error message
5. WHEN a visitor submits valid email and password credentials for signup that do not match an existing account, THE Auth_Provider SHALL create a new account
6. WHEN a visitor submits valid existing credentials for login, THE Auth_Provider SHALL create a Session with a duration of 30 days
7. WHEN a visitor submits credentials for login, IF the email does not match an existing account OR the password is incorrect, THEN THE Auth_Provider SHALL return an error and THE System SHALL display an error message within 2 seconds
8. WHEN authentication succeeds, THE System SHALL redirect the User to the Dashboard
9. WHEN a User logs out, THE Auth_Provider SHALL terminate the Session

### Requirement 3: Authentication with Google OAuth

**User Story:** As a visitor, I want to sign in with my Google account, so that I can access the application without creating a separate password.

#### Acceptance Criteria

1. WHEN a visitor is on the login page, THE System SHALL display a Google sign-in button
2. WHEN a visitor clicks the Google sign-in button, THE Auth_Provider SHALL initiate OAuth flow
3. WHEN OAuth succeeds for a first-time user, THE Auth_Provider SHALL create a new account and create a Session
4. WHEN OAuth succeeds for an existing user, THE Auth_Provider SHALL create a Session
5. WHEN OAuth succeeds, THE System SHALL redirect the User to the Dashboard
6. WHEN a visitor cancels the OAuth flow, THE System SHALL return the user to the login page without displaying an error
7. WHEN OAuth fails due to Auth_Provider error, THE System SHALL display an error message indicating the OAuth provider is unavailable

### Requirement 4: Landing Page for Visitors

**User Story:** As a visitor, I want to see a landing page that explains the application, so that I can decide whether to sign up.

#### Acceptance Criteria

1. WHEN a visitor navigates to the root URL, THE System SHALL display the landing page
2. THE Landing_Page SHALL display a message describing the purpose and features of the application
3. THE Landing_Page SHALL display a call-to-action button that navigates to the login page
4. WHILE a User has an active Session, WHEN the User navigates to the root URL, THE System SHALL redirect to the Dashboard
5. WHEN the landing page fails to load, THE System SHALL display an error message with a retry button

### Requirement 5: Protected Routes

**User Story:** As a developer, I want protected routes that require authentication, so that only authenticated users can access private application features.

#### Acceptance Criteria

1. WHEN a Visitor without an active Session attempts to access a Protected_Route, THE System SHALL redirect to the login page
2. WHEN a User with an active Session accesses a Protected_Route, IF the session is still valid, THEN THE System SHALL display the requested page
3. THE System SHALL protect the Dashboard route (/dashboard), people list route (/people), person detail route (/people/[id]), tree view route (/tree), relationship analysis route (/related), and stats route (/stats)
4. WHEN a User with an expired Session attempts to access a Protected_Route, THE System SHALL redirect to the login page
5. WHEN a Visitor is redirected to the login page from a Protected_Route, AFTER successful authentication, THE System SHALL redirect the User to the originally requested Protected_Route

### Requirement 6: Application Layout with Sidebar Navigation

**User Story:** As a user, I want a consistent navigation sidebar, so that I can easily move between different sections of the application.

#### Acceptance Criteria

1. WHILE a User is on a Protected_Route, THE System SHALL display a sidebar navigation component
2. THE Sidebar SHALL display navigation links to Dashboard, People List, Tree View, How Are We Related, and Stats pages
3. THE Sidebar SHALL display the current User's email address
4. THE Sidebar SHALL display a logout button
5. WHEN a User clicks a navigation link, THE System SHALL navigate to the corresponding page
6. THE Sidebar SHALL highlight the currently active navigation item by applying a distinct visual indicator
7. WHILE the viewport width is less than 768px, THE Sidebar SHALL be hidden by default
8. WHILE the viewport width is less than 768px, THE System SHALL provide a menu button that toggles the Sidebar visibility
9. THE Sidebar SHALL apply colors and styles consistent with the currently active theme (light or dark)
10. WHEN a User clicks the logout button, THE System SHALL terminate the Session and redirect to the landing page

### Requirement 7: Dashboard Page

**User Story:** As a user, I want a dashboard as my home screen, so that I have a starting point for using the application.

#### Acceptance Criteria

1. WHEN a User with an active Session navigates to the Dashboard route (/dashboard), THE System SHALL display the Dashboard page
2. WHEN a User navigates to the Dashboard, THE System SHALL display a welcome message containing the User's email address
3. THE Dashboard SHALL display a message indicating that data features will be implemented in a future release
4. THE Dashboard SHALL use the application layout with sidebar navigation
5. WHEN a Visitor without an active Session attempts to access the Dashboard route, THE System SHALL redirect to the login page

### Requirement 8: People List Page

**User Story:** As a user, I want to view and manage all people in my family tree, so that I can maintain accurate family records.

#### Acceptance Criteria

1. WHEN a User navigates to the people list URL (/people), THE System SHALL display the people list page
2. THE People_List_Page SHALL display the text "People" as the page title
3. THE People_List_Page SHALL use the application layout with sidebar navigation
4. WHEN the people list loads, THE System SHALL display all people in the User's Tree in a table format
5. THE People_List_Page SHALL display a search input field that filters people by full_name
6. WHEN a User types in the search field, THE System SHALL update the displayed list to show only people whose full_name contains the search text, case-insensitive, within 300 milliseconds
7. THE People_List_Page SHALL display filter controls for gender, is_alive status, city, and country
8. WHEN a User applies a filter, THE System SHALL display only people matching all selected filter criteria
9. THE People_List_Page SHALL display an "Add Person" button
10. WHEN a User clicks the "Add Person" button, THE System SHALL display a person form modal
11. THE Person_Form SHALL display input fields for full_name (required text), gender (optional dropdown with values: Male, Female, Other, Prefer not to say), birth_date (optional date picker), death_date (optional date picker), is_alive (boolean checkbox, default true), city (optional text), country (optional text), and notes (optional textarea)
12. WHEN a User submits the person form, IF full_name is empty, THEN THE System SHALL display a validation error message
13. WHEN a User submits the person form, IF is_alive is false AND death_date is empty, THEN THE System SHALL display a warning message
14. WHEN a User submits the person form, IF birth_date is after death_date, THEN THE System SHALL display a validation error message
15. WHEN a User submits the person form with a full_name that matches an existing person in the Tree, THE System SHALL display a warning message indicating a duplicate name exists and ask for confirmation
16. WHEN a User confirms adding a person with a duplicate name, THE System SHALL create the new person record
17. WHEN a User successfully adds a person, THE System SHALL save the person to the database with the User's tree_id and display a success message
18. WHEN a User clicks an edit button on a person row, THE System SHALL display the person form modal pre-populated with that person's data
19. WHEN a User updates a person, THE System SHALL validate the data using the same rules as person creation
20. WHEN a User clicks a delete button on a person row, THE System SHALL display a confirmation dialog
21. WHEN a User confirms deletion, IF the person has relationships (parents, children, or partnerships), THEN THE System SHALL display an error message preventing deletion
22. WHEN a User confirms deletion, IF the person has no relationships, THEN THE System SHALL delete the person record
23. THE Person_Form SHALL include a parent selection interface that allows adding up to 2 parents
24. WHEN a User attempts to add a third parent, THE System SHALL display a validation error message stating maximum 2 parents allowed
25. WHEN adding a parent relationship, THE System SHALL require selecting a relationship type: biological, adopted, or step
26. WHEN a User saves a person with parent relationships, THE System SHALL create parent_child records with the selected relationship types
27. WHILE the people list is loading, THE System SHALL display a loading indicator within 200 milliseconds
28. WHEN the people list is empty, THE System SHALL display a message stating "No people in your tree yet" and highlight the "Add Person" button

### Requirement 9: Person Detail Page

**User Story:** As a user, I want to view comprehensive information about a family member, so that I can understand their relationships and place in the family tree.

#### Acceptance Criteria

1. WHEN a User navigates to a person detail URL with format /people/[id], THE System SHALL display the person detail page
2. IF a User navigates to a person detail URL with an invalid or non-existent person ID, THEN THE System SHALL display an error message indicating the person was not found
3. THE Person_Detail_Page SHALL use the application layout with sidebar navigation
4. WHILE the person detail page is loading, THE System SHALL display a loading state within 200 milliseconds
5. THE Person_Detail_Page SHALL display the person's full_name as the page title
6. THE Person_Detail_Page SHALL display all person fields: gender, birth_date, death_date, is_alive status, city, country, and notes
7. THE Person_Detail_Page SHALL display a "Parents" section listing the person's parents
8. WHEN displaying parents, THE System SHALL show each parent's full_name, relationship type (biological, adopted, or step), and a clickable link to that parent's detail page
9. THE Person_Detail_Page SHALL display a "Partners" section listing all partnerships
10. WHEN displaying partners, THE System SHALL show each partner's full_name and a clickable link to that partner's detail page
11. THE Person_Detail_Page SHALL display a "Children" section listing the person's children grouped by partner
12. WHEN displaying children, THE System SHALL show each child's full_name, relationship type (biological, adopted, or step), and a clickable link to that child's detail page
13. THE Person_Detail_Page SHALL display a "Siblings" section listing the person's siblings
14. WHEN displaying siblings, THE System SHALL distinguish between full siblings (sharing both parents) and half-siblings (sharing one parent)
15. THE Person_Detail_Page SHALL compute and display the relationship from the logged-in User to the viewed person
16. WHEN the viewed person is the logged-in User, THE System SHALL display the text "This is you"
17. WHEN the viewed person is the logged-in User's parent, THE System SHALL display "your mother" or "your father" based on gender
18. WHEN the viewed person is the logged-in User's grandparent, THE System SHALL display "your grandmother" or "your grandfather" with appropriate great- prefixes for more distant ancestors
19. WHEN the viewed person is the logged-in User's sibling, THE System SHALL display "your brother" or "your sister"
20. WHEN the viewed person is the logged-in User's child, THE System SHALL display "your son" or "your daughter"
21. WHEN the viewed person is the logged-in User's grandchild, THE System SHALL display "your grandson" or "your granddaughter" with appropriate great- prefixes for more distant descendants
22. WHEN the viewed person is the logged-in User's aunt or uncle, THE System SHALL display "your aunt" or "your uncle"
23. WHEN the viewed person is the logged-in User's niece or nephew, THE System SHALL display "your niece" or "your nephew"
24. WHEN the viewed person is the logged-in User's cousin, THE System SHALL display "your first cousin", "your second cousin", etc., with "once removed", "twice removed", etc., as appropriate
25. WHEN the viewed person is the logged-in User's spouse or partner, THE System SHALL display "your spouse" or "your partner"
26. WHEN no relationship exists between the logged-in User and the viewed person, THE System SHALL display "not related"
27. THE Person_Detail_Page SHALL display an "Edit" button that opens the person form with pre-populated data
28. WHEN a section (Parents, Partners, Children, Siblings) is empty, THE System SHALL display a message indicating no data exists for that section

### Requirement 10: Tree View Page

**User Story:** As a user, I want to visualize my family tree in an interactive graph, so that I can understand family structure and navigate relationships visually.

#### Acceptance Criteria

1. WHEN a User navigates to the tree view URL (/tree), THE System SHALL display the tree view page
2. THE Tree_View_Page SHALL display the text "Family Tree" as the page title
3. THE Tree_View_Page SHALL use the application layout with sidebar navigation
4. WHEN a Visitor without an active Session attempts to access the tree view URL, THE System SHALL redirect to the login page
5. WHEN the tree view page fails to load, THE System SHALL display an error message with a retry button
6. THE Tree_View_Page SHALL render the family tree using React Flow library
7. THE System SHALL represent each person as a node in the graph
8. WHEN rendering the tree layout, THE System SHALL position ancestors above their descendants
9. WHEN rendering the tree layout, THE System SHALL position descendants below their ancestors
10. WHEN rendering the tree layout, THE System SHALL position partners horizontally adjacent to each other
11. THE System SHALL display edges connecting parents to children
12. THE System SHALL display edges connecting partners to each other
13. WHEN a User clicks on a person node, THE System SHALL navigate to that person's detail page
14. THE System SHALL display each node with the person's full_name
15. WHEN a person node represents a deceased person, THE System SHALL apply a visual indicator (such as a border color or icon) to distinguish them from living people
16. THE Tree_View_Page SHALL provide zoom controls allowing users to zoom in and out
17. THE Tree_View_Page SHALL provide pan controls allowing users to drag the canvas to view different parts of the tree
18. WHEN the tree contains more than 50 people, THE System SHALL initially render a zoomed-out view showing the entire tree
19. WHEN the tree is empty, THE System SHALL display a message stating "No people in your tree yet" with a link to the people list page
20. WHILE the tree view is loading, THE System SHALL display a loading indicator within 200 milliseconds

### Requirement 11: Relationship Analysis Page

**User Story:** As a user, I want to analyze how two people in my tree are related, so that I can understand complex family connections.

#### Acceptance Criteria

1. WHEN a User with an active Session navigates to the relationship analysis URL (/related), THE System SHALL display the relationship analysis page
2. THE Relationship_Analysis_Page SHALL display the text "How Are We Related" as the page title
3. THE Relationship_Analysis_Page SHALL use the application layout with sidebar navigation
4. WHEN a Visitor without an active Session attempts to access the relationship analysis URL, THE System SHALL redirect to the login page
5. THE Relationship_Analysis_Page SHALL display two person picker dropdowns labeled "Person 1" and "Person 2"
6. WHEN a person picker is opened, THE System SHALL display a searchable list of all people in the User's Tree
7. WHEN a User types in a person picker search field, THE System SHALL filter the list to show only people whose full_name contains the search text, case-insensitive
8. WHEN a User selects two different people, THE System SHALL compute and display the relationship between them
9. THE Relationship_Analysis_Page SHALL display a section showing the relationship label (e.g., "first cousin", "grandmother", "not related")
10. THE Relationship_Analysis_Page SHALL display the path between the two selected people, showing intermediate family members
11. THE Relationship_Analysis_Page SHALL display common ancestor(s) if they exist
12. WHEN the selected people are parent and child, THE System SHALL display "parent" or "child" with appropriate gender terms (mother, father, son, daughter)
13. WHEN the selected people are grandparent and grandchild with 1 generation gap, THE System SHALL display "grandparent" or "grandchild" with appropriate gender terms
14. WHEN the selected people are grandparent and grandchild with 2 or more generation gaps, THE System SHALL display "great-grandparent" or "great-grandchild" with appropriate number of "great-" prefixes
15. WHEN the selected people share both parents, THE System SHALL display "sibling" with appropriate gender term (brother, sister)
16. WHEN the selected people share exactly one parent, THE System SHALL display "half-sibling" with appropriate gender term (half-brother, half-sister)
17. WHEN the selected people are aunt/uncle and niece/nephew, THE System SHALL display "aunt", "uncle", "niece", or "nephew"
18. WHEN the selected people are first cousins (children of siblings), THE System SHALL display "first cousin"
19. WHEN the selected people are second cousins (grandchildren of siblings), THE System SHALL display "second cousin"
20. WHEN the selected people are Nth cousins (share a common ancestor N+1 generations back), THE System SHALL display "Nth cousin"
21. WHEN the selected people are cousins with different generational distances from the common ancestor, THE System SHALL display "cousin" with "once removed", "twice removed", etc., based on the generation difference
22. WHEN the selected people are married or partnered, THE System SHALL display "spouse" or "partner"
23. WHEN no blood or marriage relationship exists between the selected people, THE System SHALL display "not related"
24. WHEN a User selects the same person in both pickers, THE System SHALL display a message "Please select two different people"
25. WHEN a User has not yet selected both people, THE System SHALL display a message prompting them to select two people
26. WHEN multiple relationship paths exist between two people, THE System SHALL display the closest relationship
27. WHILE the relationship is being computed, THE System SHALL display a loading indicator within 200 milliseconds

### Requirement 12: Statistics Page

**User Story:** As a user, I want to view statistics about my family tree, so that I can gain insights about my family data.

#### Acceptance Criteria

1. WHEN a User with an active Session navigates to the stats URL (/stats), THE System SHALL display the statistics page
2. THE Stats_Page SHALL display the text "Statistics" as the page title
3. THE Stats_Page SHALL use the application layout with sidebar navigation
4. WHEN a Visitor without an active Session attempts to access the stats URL, THE System SHALL redirect to the login page
5. THE Stats_Page SHALL display a "Total Members" card showing the count of all people in the User's Tree
6. THE Stats_Page SHALL display an "Alive" card showing the count of people where is_alive equals true
7. THE Stats_Page SHALL display a "Deceased" card showing the count of people where is_alive equals false
8. THE Stats_Page SHALL display a "By Country" card showing the top 5 countries by person count
9. WHEN displaying the "By Country" card, THE System SHALL show each country name and the count of people from that country
10. WHEN displaying the "By Country" card, IF fewer than 5 countries exist in the Tree, THEN THE System SHALL display only the existing countries
11. THE Stats_Page SHALL display a "By City" card showing the top 5 cities by person count
12. WHEN displaying the "By City" card, THE System SHALL show each city name and the count of people from that city
13. WHEN displaying the "By City" card, IF fewer than 5 cities exist in the Tree, THEN THE System SHALL display only the existing cities
14. THE Stats_Page SHALL display an "Oldest Ancestor" card showing the person with the earliest birth_date
15. WHEN displaying the "Oldest Ancestor" card, THE System SHALL show the person's full_name and birth year
16. WHEN displaying the "Oldest Ancestor" card, IF no people have birth_date values, THEN THE System SHALL display "No birth dates recorded"
17. THE Stats_Page SHALL display a "Recent Additions" card showing the last 10 people added to the Tree
18. WHEN displaying the "Recent Additions" card, THE System SHALL show each person's full_name and the timestamp when they were created
19. WHEN displaying the "Recent Additions" card, THE System SHALL order people by creation timestamp in descending order (most recent first)
20. WHEN displaying the "Recent Additions" card, IF fewer than 10 people exist in the Tree, THEN THE System SHALL display all existing people
21. WHEN displaying the "Recent Additions" card, THE System SHALL format timestamps as relative time (e.g., "2 hours ago", "3 days ago")
22. WHILE statistics are loading, THE System SHALL display a loading indicator within 200 milliseconds
23. WHEN the tree is empty, THE Stats_Page SHALL display a message stating "No data available yet" with a link to the people list page

### Requirement 13: Error and Loading States

**User Story:** As a user, I want clear feedback when pages are loading or errors occur, so that I understand the application state.

#### Acceptance Criteria

1. WHILE authentication is in progress, THE System SHALL display a loading indicator within 200 milliseconds
2. WHILE authentication is in progress for more than 30 seconds, THE System SHALL display a timeout error message
3. WHILE a Protected_Route is checking authentication, THE System SHALL display a loading indicator within 200 milliseconds
4. WHEN an authentication error occurs, THE System SHALL display an error message that contains the error type and a retry button
5. WHEN a page load error occurs, THE System SHALL display an error message that contains the error type and a retry button
6. WHEN a User clicks a retry button after an error, THE System SHALL attempt the failed operation again
7. WHEN a User has clicked a retry button 3 times without success, THE System SHALL disable the retry button and display a message to contact support

### Requirement 14: Theme Support

**User Story:** As a user, I want to switch between light and dark modes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN the System initializes, IF no theme preference exists in local storage, THEN THE System SHALL default to light mode
2. THE System SHALL support light mode theme with light background colors and dark text
3. THE System SHALL support dark mode theme with dark background colors and light text
4. THE System SHALL persist the User's theme preference in browser local storage
5. WHEN the System fails to persist the theme preference, THE System SHALL continue to apply the theme for the current session
6. THE System SHALL provide a theme toggle control in the sidebar
7. WHEN a User toggles the theme, THE System SHALL apply the new theme to all UI components within 100 milliseconds
8. WHEN the System initializes, THE System SHALL read the theme preference from local storage and apply it before the first paint

### Requirement 15: Responsive Design

**User Story:** As a user, I want the application to work on mobile devices, so that I can access my family tree on any device.

#### Acceptance Criteria

1. THE System SHALL display without horizontal scrolling on viewport widths from 320px to 767px (mobile)
2. THE System SHALL display without horizontal scrolling on viewport widths from 768px to 1023px (tablet)
3. THE System SHALL display without horizontal scrolling on viewport widths from 1024px to 1920px (desktop)
4. THE System SHALL ensure all interactive elements have a minimum touch target size of 44x44 pixels
5. THE System SHALL use a minimum font size of 16px for body text
6. WHILE the viewport width is less than 768px, THE Sidebar SHALL be hidden by default
7. WHILE the viewport width is less than 768px, THE System SHALL provide a menu button that, when clicked, displays the Sidebar

### Requirement 16: Multi-Tenancy and Data Isolation

**User Story:** As a user, I want my family tree data to be completely isolated from other users' data, so that my privacy is protected and I only see my own family information.

#### Acceptance Criteria

1. THE System SHALL include a tree_id column as a foreign key in the person table
2. THE System SHALL include a tree_id column as a foreign key in the parent_child table
3. THE System SHALL include a tree_id column as a foreign key in the partnership table
4. THE System SHALL include a tree table with columns: id, name, created_at, updated_at
5. THE System SHALL include a tree_member table with columns: tree_id, user_id, role, created_at
6. THE tree_member role column SHALL accept values: owner, editor, or viewer
7. WHEN a new User signs up, THE System SHALL automatically create a new Tree and assign the User as owner
8. THE System SHALL implement Supabase Row Level Security (RLS) policies on the person table that restrict access to rows where tree_id matches a tree the User has access to
9. THE System SHALL implement Supabase Row Level Security (RLS) policies on the parent_child table that restrict access to rows where tree_id matches a tree the User has access to
10. THE System SHALL implement Supabase Row Level Security (RLS) policies on the partnership table that restrict access to rows where tree_id matches a tree the User has access to
11. WHEN a User queries for people, THE System SHALL automatically scope the query to include only people with tree_id values the User has access to
12. WHEN a User queries for relationships, THE System SHALL automatically scope the query to include only relationships with tree_id values the User has access to
13. WHEN a User creates a new person, THE System SHALL automatically set the tree_id to the User's current Tree
14. WHEN a User creates a new relationship, THE System SHALL automatically set the tree_id to the User's current Tree
15. WHEN a User attempts to access data from a Tree they do not have access to, THE System SHALL return an empty result set or error
16. THE System SHALL prevent Users from modifying tree_id values on existing records
17. WHEN a User with viewer role attempts to create, update, or delete data, THE RLS policies SHALL deny the operation
18. WHEN a User with editor role attempts to create, update, or delete data in their Tree, THE RLS policies SHALL allow the operation
19. WHEN a User with owner role attempts to create, update, or delete data in their Tree, THE RLS policies SHALL allow the operation
20. THE System SHALL allow owner role Users to invite other Users as editor or viewer
21. THE System SHALL validate that all relationship references (parent_child, partnership) are between people in the same Tree


## Out of Scope for MVP

The following features are explicitly excluded from the MVP release and may be considered for future versions:

- **Photo Upload**: Ability to upload and attach photos to person records
- **GEDCOM Import/Export**: Support for importing family tree data from or exporting to GEDCOM file format
- **Payment Processing**: Subscription plans, payment processing, and billing management
- **Map View**: Geographic visualization of family member locations on an interactive map
