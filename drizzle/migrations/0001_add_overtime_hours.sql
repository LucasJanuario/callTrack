ALTER TABLE public.profiles ADD COLUMN salario numeric;

CREATE TABLE public.overtime_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  hours_100 numeric NOT NULL DEFAULT 0,
  hours_70 numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.overtime_entries TO authenticated;
GRANT ALL ON public.overtime_entries TO service_role;

ALTER TABLE public.overtime_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "overtime_select_auth" ON public.overtime_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "overtime_insert_own" ON public.overtime_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "overtime_update_own" ON public.overtime_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "overtime_delete_own" ON public.overtime_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "overtime_admin_all" ON public.overtime_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));