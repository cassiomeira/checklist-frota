-- Create transaction_attachments table
CREATE TABLE IF NOT EXISTS public.transaction_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transaction_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies (inheriting access from the transaction)
-- A user can see attachments if they can see the transaction (company isolation handled via transaction join usually, or we can duplicate company_id if needed, but here we likely rely on the cascade and transaction ownership)
-- Actually, for simplicity and security, let's just make sure the user owns the transaction or is in the same tenant context.
-- Since we don't have company_id on attachments, we rely on the Join.
-- However, Supabase RLS with joins can be tricky for performance.
-- Let's check how transactions are secured. They have `created_by` (user_id).
-- We can check if the user has access to the transaction.

CREATE POLICY "Users can view attachments of their transactions" ON public.transaction_attachments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_attachments.transaction_id
            AND t.created_by = auth.uid()
        )
    );

-- Actually, a simpler approach for this app given the "owner" context might be just allowing authenticated users if we are less strict, 
-- but better to stick to the pattern. 
-- The previous strategy for transactions was: 
-- CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (created_by = auth.uid());
-- So we replicate that.

DROP POLICY IF EXISTS "Users can manage attachments of their transactions" ON public.transaction_attachments;

CREATE POLICY "Users can manage attachments of their transactions" ON public.transaction_attachments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_attachments.transaction_id
            AND t.created_by = auth.uid()
        )
    );

-- Data Migration: Move existing attachment_url to the new table
INSERT INTO public.transaction_attachments (transaction_id, file_url, file_name, file_type)
SELECT 
    id, 
    attachment_url, 
    'anexo_migrado.png', -- Default name since we didn't store it
    'image/png' -- Default type, will allow downloading at least
FROM public.transactions 
WHERE attachment_url IS NOT NULL AND attachment_url != '';

-- Optional: We can drop the old column later, but keeping it for safety for now.
-- ALTER TABLE public.transactions DROP COLUMN attachment_url;
