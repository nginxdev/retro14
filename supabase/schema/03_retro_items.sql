-- Retro Items (Cards) Table Schema
CREATE TABLE IF NOT EXISTS public.retro_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    column_id TEXT NOT NULL,
    sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.retro_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    is_staged BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'card',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    author_name TEXT,
    author_role TEXT,
    author_color TEXT,
    votes JSONB DEFAULT '{}'::JSONB,
    reactions JSONB DEFAULT '[]'::JSONB,
    comments JSONB DEFAULT '[]'::JSONB,
    "actionItems" JSONB DEFAULT '[]'::JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS retro_items_sprint_id_idx ON public.retro_items (sprint_id);
CREATE INDEX IF NOT EXISTS retro_items_parent_id_idx ON public.retro_items (parent_id);

-- Row Level Security
ALTER TABLE public.retro_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retro_items FORCE ROW LEVEL SECURITY;

-- Policies

-- SELECT: Visible if public (published) OR it's your own item (draft)
DROP POLICY IF EXISTS "draft_read_policy" ON public.retro_items;
CREATE POLICY "draft_read_policy" 
    ON public.retro_items FOR SELECT 
    USING ( (COALESCE(is_staged, false) = false) OR (user_id = auth.uid()) );

-- INSERT: Authenticated users can insert
DROP POLICY IF EXISTS "draft_insert_policy" ON public.retro_items;
CREATE POLICY "draft_insert_policy" 
    ON public.retro_items FOR INSERT 
    WITH CHECK ( true ); 

-- UPDATE: Allow update if you can see it (published or own draft)
DROP POLICY IF EXISTS "draft_update_policy" ON public.retro_items;
CREATE POLICY "draft_update_policy" 
    ON public.retro_items FOR UPDATE 
    USING ( (is_staged = false) OR (user_id = auth.uid()) )
    WITH CHECK ( (is_staged = false) OR (user_id = auth.uid()) );

-- DELETE: Allow any authenticated user to delete (Enforced via frontend permissions)
DROP POLICY IF EXISTS "draft_delete_policy" ON public.retro_items;
CREATE POLICY "draft_delete_policy" 
    ON public.retro_items FOR DELETE 
    USING ( auth.uid() IS NOT NULL );

-- Realtime Configuration
ALTER TABLE public.retro_items REPLICA IDENTITY FULL;
