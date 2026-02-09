-- Consolidated Realtime Configuration

-- 1. Ensure Replica Identity is FULL for all relevant tables
-- This is critical for catching old values in UPDATE/DELETE events
ALTER TABLE public.sprints REPLICA IDENTITY FULL;
ALTER TABLE public.retro_items REPLICA IDENTITY FULL;
ALTER TABLE public.retro_users REPLICA IDENTITY FULL;

-- 2. Explicitly add tables to the Realtime publication
-- Note: Some Supabase projects manage this automatically, but these commands 
-- ensure consistency across different environments.
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retro_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retro_users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprint_participants;
