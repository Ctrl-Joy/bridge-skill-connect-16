/*
  # Complete UniBridge Database Schema

  ## Tables Created
  
  1. **profiles**
     - User profile information
     - Links to auth.users
     - Stores name, department, year, bio, resume URL
  
  2. **skills**
     - User skills with AI embeddings
     - Vector embeddings for semantic matching
  
  3. **mentorships**
     - Mentor-mentee relationships
     - Status tracking (pending, accepted, rejected)
     - Similarity scores
  
  4. **teams**
     - Hackathon team information
     - Required skills and team size
  
  5. **team_members**
     - Team membership records
     - Match scores for each member
  
  6. **doubts**
     - Student questions and doubts
     - AI-generated responses
     - Subject categorization
  
  7. **doubt_responses**
     - Responses to doubts from seniors/AI
     - Helpful vote tracking
  
  8. **notes**
     - Study notes and materials
     - Department and subject organization
     - File storage references
  
  9. **forums**
     - Discussion forums by department
     - Thread and reply structure
  
  10. **forum_posts**
      - Individual forum posts
      - Parent-child relationships for threads
  
  11. **clubs**
      - Campus clubs and societies
      - Category and description
  
  12. **club_members**
      - Club membership records
      - Role tracking (member, admin, president)
  
  13. **research_projects**
      - Faculty research projects
      - Required skills and openings
  
  14. **research_applications**
      - Student applications to research projects
      - Status tracking
  
  15. **gamification**
      - User XP and level tracking
      - Badge system
  
  16. **notifications**
      - Real-time user notifications
      - Read/unread status

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users
  - Ownership and membership checks
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  department text NOT NULL,
  year integer NOT NULL CHECK (year >= 1 AND year <= 6),
  bio text,
  resume_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Skills table with vector embeddings
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  embedding float8[] NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all skills"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON skills FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
  similarity_score float8,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(mentor_id, mentee_id)
);

ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mentorships"
  ON mentorships FOR SELECT
  TO authenticated
  USING (
    mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    OR mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create mentorship requests"
  ON mentorships FOR INSERT
  TO authenticated
  WITH CHECK (mentee_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Mentors can update mentorship status"
  ON mentorships FOR UPDATE
  TO authenticated
  USING (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (mentor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  required_skills text[] NOT NULL,
  team_size integer NOT NULL CHECK (team_size >= 3 AND team_size <= 5),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update own teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_score float8,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(team_id, profile_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team creators can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (team_id IN (SELECT id FROM teams WHERE created_by = auth.uid()))
  WITH CHECK (team_id IN (SELECT id FROM teams WHERE created_by = auth.uid()));

-- Doubts table
CREATE TABLE IF NOT EXISTS doubts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  subject text NOT NULL,
  ai_response text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all doubts"
  ON doubts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own doubts"
  ON doubts FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own doubts"
  ON doubts FOR UPDATE
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Doubt responses table
CREATE TABLE IF NOT EXISTS doubt_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  doubt_id uuid REFERENCES doubts(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response text NOT NULL,
  helpful_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE doubt_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all responses"
  ON doubt_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create responses"
  ON doubt_responses FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  department text NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all notes"
  ON notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Forums table
CREATE TABLE IF NOT EXISTS forums (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  department text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all forums"
  ON forums FOR SELECT
  TO authenticated
  USING (true);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id uuid REFERENCES forums(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all clubs"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

-- Club members table
CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'admin', 'president')) NOT NULL,
  joined_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(club_id, profile_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all club members"
  ON club_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join clubs"
  ON club_members FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Research projects table
CREATE TABLE IF NOT EXISTS research_projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  faculty_name text NOT NULL,
  department text NOT NULL,
  description text,
  required_skills text[] NOT NULL,
  openings integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all research projects"
  ON research_projects FOR SELECT
  TO authenticated
  USING (true);

-- Research applications table
CREATE TABLE IF NOT EXISTS research_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES research_projects(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
  message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(project_id, profile_id)
);

ALTER TABLE research_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON research_applications FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create applications"
  ON research_applications FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Gamification table
CREATE TABLE IF NOT EXISTS gamification (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  xp integer DEFAULT 0 NOT NULL,
  level integer DEFAULT 1 NOT NULL,
  badges text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gamification data"
  ON gamification FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own gamification"
  ON gamification FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  link text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON mentorships(mentee_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_doubts_profile_id ON doubts(profile_id);
CREATE INDEX IF NOT EXISTS idx_doubt_responses_doubt_id ON doubt_responses(doubt_id);
CREATE INDEX IF NOT EXISTS idx_notes_department ON notes(department);
CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_id ON forum_posts(forum_id);
CREATE INDEX IF NOT EXISTS idx_club_members_club_id ON club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);

-- Insert sample data for clubs
INSERT INTO clubs (name, category, description) VALUES
  ('Coding Club', 'Technical', 'Learn programming and participate in competitive coding'),
  ('Robotics Society', 'Technical', 'Build robots and work on automation projects'),
  ('Design Club', 'Creative', 'UI/UX design, graphic design, and digital art'),
  ('Entrepreneurship Cell', 'Business', 'Learn about startups and entrepreneurship')
ON CONFLICT DO NOTHING;

-- Insert sample research projects
INSERT INTO research_projects (title, faculty_name, department, description, required_skills, openings) VALUES
  ('AI in Healthcare Diagnostics', 'Dr. Sarah Johnson', 'Computer Science', 'Developing machine learning models for medical diagnosis', ARRAY['Machine Learning', 'Python', 'Data Analysis'], 2),
  ('Sustainable Energy Solutions', 'Dr. Michael Chen', 'Electrical Engineering', 'Research on renewable energy and IoT integration', ARRAY['Electronics', 'IoT', 'Data Science'], 3),
  ('Natural Language Processing', 'Dr. Emily Rodriguez', 'Computer Science', 'Advanced NLP research for language understanding', ARRAY['NLP', 'Deep Learning', 'Python'], 1)
ON CONFLICT DO NOTHING;