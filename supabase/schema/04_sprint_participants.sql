-- Sprint Participants Mapping Table Schema
CREATE TABLE IF NOT EXISTS public.sprint_participants (
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.retro_users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (sprint_id, user_id)
);

-- Security Definer Function to check participation without RLS recursion
CREATE OR REPLACE FUNCTION public.check_is_sprint_participant(sprint_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.sprint_participants
        WHERE sprint_id = sprint_id_param
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE public.sprint_participants ENABLE ROW LEVEL SECURITY;

-- Policies

-- SELECT: Allow users to see their own records OR records of others in their sprints
DROP POLICY IF EXISTS "Users can view participants of sprints they belong to" ON public.sprint_participants;
CREATE POLICY "Users can view participants of sprints they belong to"
    ON public.sprint_participants FOR SELECT
    USING ( 
        user_id = auth.uid() 
        OR 
        public.check_is_sprint_participant(sprint_id) 
    );

-- INSERT: Allow authenticated users to join sprints
DROP POLICY IF EXISTS "Users can join sprints" ON public.sprint_participants;
CREATE POLICY "Users can join sprints"
    ON public.sprint_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Allow users to touch their own record (required for app upserts)
DROP POLICY IF EXISTS "Users can update own participation" ON public.sprint_participants;
CREATE POLICY "Users can update own participation"
    ON public.sprint_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
