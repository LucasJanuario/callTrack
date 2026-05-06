CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select_auth" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_insert_auth" ON public.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "notes_update_auth" ON public.notes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "notes_delete_auth" ON public.notes FOR DELETE TO authenticated USING (true);

CREATE TRIGGER notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER TABLE public.notes REPLICA IDENTITY FULL;