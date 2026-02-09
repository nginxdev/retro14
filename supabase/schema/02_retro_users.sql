-- Retro Users Profile Table Schema
CREATE TABLE IF NOT EXISTS public.retro_users (
    id UUID PRIMARY KEY, -- Matches auth.users id
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    role TEXT,
    is_hand_raised BOOLEAN DEFAULT false,
    hand_raised_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS retro_users_hand_raised_idx ON public.retro_users (is_hand_raised, hand_raised_at);

-- Row Level Security
ALTER TABLE public.retro_users ENABLE ROW LEVEL SECURITY;

-- Policies

-- Allow everyone to view all users (needed for team presence)
DROP POLICY IF EXISTS "Public users are visible" ON public.retro_users;
CREATE POLICY "Public users are visible"
    ON public.retro_users FOR SELECT
    USING ( true );

-- Allow users to update ONLY their own profile (for hand raising, etc.)
DROP POLICY IF EXISTS "Users can update own profile" ON public.retro_users;
CREATE POLICY "Users can update own profile"
    ON public.retro_users FOR UPDATE
    USING ( auth.uid() = id )
    WITH CHECK ( auth.uid() = id );

-- Allow users to insert their own profile initial data
DROP POLICY IF EXISTS "Users can insert own profile" ON public.retro_users;
CREATE POLICY "Users can insert own profile"
    ON public.retro_users FOR INSERT
    WITH CHECK ( auth.uid() = id );
