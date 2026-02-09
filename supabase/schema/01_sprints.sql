-- Sprints Table Schema
CREATE TABLE IF NOT EXISTS public.sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    configuration JSONB DEFAULT '{}'::JSONB,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS sprints_code_idx ON public.sprints (code);

-- Row Level Security
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow all access to sprints" ON public.sprints;
CREATE POLICY "Allow all access to sprints" 
    ON public.sprints FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Realtime Configuration
ALTER TABLE public.sprints REPLICA IDENTITY FULL;
