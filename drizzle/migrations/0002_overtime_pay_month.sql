ALTER TABLE public.overtime_entries ADD COLUMN pay_month text;
UPDATE public.overtime_entries SET pay_month = to_char(entry_date, 'YYYY-MM') WHERE pay_month IS NULL;