ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS canal TEXT NOT NULL DEFAULT 'Fone';

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;