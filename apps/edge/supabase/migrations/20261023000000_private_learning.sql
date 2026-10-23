-- Close the v0 public policies. v2 keeps progress on the learner's device;
-- existing data is preserved and only its authenticated owner may read it.
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated update to users" ON public.users;
CREATE POLICY "Read own profile" ON public.users FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "Insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (id = (SELECT auth.uid()));
CREATE POLICY "Update own profile" ON public.users FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow public read access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow authenticated insert to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow authenticated update to sessions" ON public.sessions;
CREATE POLICY "Own sessions" ON public.sessions FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Allow public read access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated insert to messages" ON public.messages;
CREATE POLICY "Read own messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())));
CREATE POLICY "Insert own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Allow public read access to scores" ON public.scores;
DROP POLICY IF EXISTS "Allow authenticated insert to scores" ON public.scores;
CREATE POLICY "Read own scores" ON public.scores FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Allow authenticated insert to vocabulary_lists" ON public.vocabulary_lists;
DROP POLICY IF EXISTS "Allow authenticated update to vocabulary_lists" ON public.vocabulary_lists;

CREATE TABLE public.ai_daily_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  calls integer NOT NULL DEFAULT 0 CHECK (calls >= 0),
  PRIMARY KEY (user_id, usage_date)
);
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_daily_usage FROM anon, authenticated;

-- Atomic across isolates and concurrent requests. Only Edge Functions' service
-- role can consume the budget; callers cannot supply a larger limit.
CREATE OR REPLACE FUNCTION public.consume_ai_budget(learner_id uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE used integer;
BEGIN
  INSERT INTO public.ai_daily_usage(user_id, usage_date, calls)
  VALUES(learner_id, (now() AT TIME ZONE 'UTC')::date, 1)
  ON CONFLICT(user_id, usage_date) DO UPDATE SET calls = ai_daily_usage.calls + 1
    WHERE ai_daily_usage.calls < 120
  RETURNING calls INTO used;
  RETURN used IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_ai_budget(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_budget(uuid) TO service_role;
