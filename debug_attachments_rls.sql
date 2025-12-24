-- DEBUG: Temporarily disable RLS and allow all operations for authenticated users on attachments
ALTER TABLE public.transaction_attachments DISABLE ROW LEVEL SECURITY;

-- Just in case strict RLS is re-enabled, verify specific policies
DROP POLICY IF EXISTS "Users can view attachments of their transactions" ON public.transaction_attachments;
DROP POLICY IF EXISTS "Users can manage attachments of their transactions" ON public.transaction_attachments;

-- Very permissive policy for debugging (Authenticated users can do anything)
CREATE POLICY "Debug Full Access" ON public.transaction_attachments
    FOR ALL
    USING (auth.role() = 'authenticated');

ALTER TABLE public.transaction_attachments ENABLE ROW LEVEL SECURITY;
