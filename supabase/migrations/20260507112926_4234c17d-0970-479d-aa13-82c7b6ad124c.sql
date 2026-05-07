
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT SELECT ON public.notes TO anon;
GRANT ALL ON public.notes TO service_role;
NOTIFY pgrst, 'reload schema';
