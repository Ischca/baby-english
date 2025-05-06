CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  age_level INTEGER DEFAULT 0 NOT NULL CHECK (age_level >= 0 AND age_level <= 18)
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  mission_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  mission TEXT NOT NULL,
  target_words TEXT[] NOT NULL,
  success BOOLEAN NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vocabulary_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  min_age_level INTEGER NOT NULL CHECK (min_age_level >= 0 AND min_age_level <= 18),
  max_age_level INTEGER NOT NULL CHECK (max_age_level >= 0 AND max_age_level <= 18),
  words TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT min_max_age_check CHECK (min_age_level <= max_age_level)
);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('colors', 0, 3, ARRAY['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown']),
('numbers', 0, 3, ARRAY['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']),
('greetings', 0, 3, ARRAY['hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good']);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to sessions" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to messages" ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to scores" ON public.scores FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to scores" ON public.scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to vocabulary_lists" ON public.vocabulary_lists FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to vocabulary_lists" ON public.vocabulary_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to vocabulary_lists" ON public.vocabulary_lists FOR UPDATE USING (true);
