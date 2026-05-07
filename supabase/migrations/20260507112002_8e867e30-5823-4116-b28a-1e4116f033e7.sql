
-- Garantir RLS habilitado
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Recriar políticas (qualquer autenticado pode ver/criar/editar/excluir)
DROP POLICY IF EXISTS "notes_select_auth" ON public.notes;
DROP POLICY IF EXISTS "notes_insert_auth" ON public.notes;
DROP POLICY IF EXISTS "notes_update_auth" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_auth" ON public.notes;

CREATE POLICY "notes_select_auth" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_insert_auth" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "notes_update_auth" ON public.notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notes_delete_auth" ON public.notes FOR DELETE TO authenticated USING (true);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.notes REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Forçar reload do schema cache do PostgREST
NOTIFY pgrst, 'reload schema';
