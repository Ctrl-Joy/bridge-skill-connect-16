-- Create doubts table for AI Doubt Solver
CREATE TABLE public.doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all doubts"
  ON public.doubts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own doubts"
  ON public.doubts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = doubts.profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own doubts"
  ON public.doubts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = doubts.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create doubt responses table
CREATE TABLE public.doubt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id UUID NOT NULL REFERENCES public.doubts(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  response_text TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.doubt_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all responses"
  ON public.doubt_responses FOR SELECT
  USING (true);

CREATE POLICY "Users can create responses"
  ON public.doubt_responses FOR INSERT
  WITH CHECK (
    is_ai = false AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = doubt_responses.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Create clubs table
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all clubs"
  ON public.clubs FOR SELECT
  USING (true);

-- Create club members table
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(club_id, profile_id)
);

ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all club members"
  ON public.club_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join clubs"
  ON public.club_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = club_members.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create research projects table
CREATE TABLE public.research_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  faculty TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  open_positions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all research projects"
  ON public.research_projects FOR SELECT
  USING (true);

-- Create research applications table
CREATE TABLE public.research_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, profile_id)
);

ALTER TABLE public.research_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all applications"
  ON public.research_applications FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own applications"
  ON public.research_applications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = research_applications.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create department notes table
CREATE TABLE public.department_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.department_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes from their department"
  ON public.department_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.department = department_notes.department
  ));

CREATE POLICY "Users can create notes"
  ON public.department_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = department_notes.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view forum posts from their department"
  ON public.forum_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.department = forum_posts.department
  ));

CREATE POLICY "Users can create forum posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = forum_posts.profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create user XP table for gamification
CREATE TABLE public.user_xp (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all XP data"
  ON public.user_xp FOR SELECT
  USING (true);

CREATE POLICY "System can update XP"
  ON public.user_xp FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can modify XP"
  ON public.user_xp FOR UPDATE
  USING (true);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  xp_requirement INTEGER DEFAULT 0
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all badges"
  ON public.badges FOR SELECT
  USING (true);

-- Create user badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all earned badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- Create video rooms table
CREATE TABLE public.video_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL UNIQUE,
  host_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participants UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.video_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all video rooms"
  ON public.video_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create video rooms"
  ON public.video_rooms FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = video_rooms.host_profile_id
    AND profiles.user_id = auth.uid()
  ));

CREATE POLICY "Hosts can update their rooms"
  ON public.video_rooms FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = video_rooms.host_profile_id
    AND profiles.user_id = auth.uid()
  ));

-- Create trigger for updating updated_at
CREATE TRIGGER update_doubts_updated_at
  BEFORE UPDATE ON public.doubts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial data for clubs
INSERT INTO public.clubs (name, category, required_skills) VALUES
  ('Tech Club', 'Technology', ARRAY['Programming', 'Web Development']),
  ('Robotics Club', 'Engineering', ARRAY['Robotics', 'Arduino', 'Python']),
  ('Data Science Club', 'Technology', ARRAY['Python', 'Machine Learning', 'Statistics']),
  ('Design Club', 'Creative', ARRAY['UI/UX', 'Figma', 'Adobe XD']),
  ('Business Club', 'Business', ARRAY['Marketing', 'Finance', 'Strategy']);

-- Insert some initial badges
INSERT INTO public.badges (name, description, icon, xp_requirement) VALUES
  ('First Steps', 'Complete your profile', '🎯', 0),
  ('Mentor Match', 'Connect with your first mentor', '🤝', 50),
  ('Team Player', 'Join your first team', '👥', 100),
  ('Knowledge Seeker', 'Ask 10 doubts', '❓', 150),
  ('Rising Star', 'Reach 500 XP', '⭐', 500),
  ('Expert', 'Reach 1000 XP', '🏆', 1000);

-- Insert some initial research projects
INSERT INTO public.research_projects (title, faculty, department, required_skills, open_positions) VALUES
  ('AI in Healthcare', 'Dr. Smith', 'Computer Science', ARRAY['Machine Learning', 'Python', 'Data Analysis'], 2),
  ('Sustainable Energy Systems', 'Dr. Johnson', 'Mechanical Engineering', ARRAY['Thermodynamics', 'CAD', 'Research'], 3),
  ('Quantum Computing Research', 'Dr. Williams', 'Physics', ARRAY['Quantum Mechanics', 'Programming', 'Mathematics'], 1),
  ('Blockchain Applications', 'Dr. Brown', 'Computer Science', ARRAY['Blockchain', 'Cryptography', 'Solidity'], 2);