
COMMENT ON TABLE public.notes IS 'Shared notes - cache reload trigger';
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
