INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('colors', 4, 6, ARRAY['gray', 'gold', 'silver', 'beige', 'turquoise']),
('colors', 7, 10, ARRAY['navy', 'maroon', 'teal', 'olive', 'violet', 'indigo', 'magenta', 'cyan']),
('colors', 11, 14, ARRAY['crimson', 'scarlet', 'emerald', 'azure', 'lavender', 'ivory', 'coral']),
('colors', 15, 18, ARRAY['burgundy', 'chartreuse', 'periwinkle', 'mauve', 'ochre', 'taupe', 'cerulean', 'vermilion', 'amber', 'aquamarine']);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('numbers', 4, 6, ARRAY['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']),
('numbers', 7, 10, ARRAY['thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred']),
('numbers', 11, 14, ARRAY['thousand', 'million', 'billion', 'first', 'second', 'third', 'fourth', 'fifth']),
('numbers', 15, 18, ARRAY['trillion', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'hundredth', 'thousandth', 'millionth']);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('greetings', 4, 6, ARRAY['morning', 'afternoon', 'evening', 'night', 'welcome', 'how are you', 'fine', 'great', 'okay']),
('greetings', 7, 10, ARRAY['nice to meet you', 'see you later', 'excuse me', 'pardon', 'congratulations', 'well done']),
('greetings', 11, 14, ARRAY['greetings', 'farewell', 'pleasure to meet you', 'how do you do', 'take care', 'regards', 'sincerely']),
('greetings', 15, 18, ARRAY['salutations', 'cordially', 'best wishes', 'warmest regards', 'kind regards', 'respectfully', 'yours truly', 'looking forward']);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('verbs', 0, 3, ARRAY['go', 'come', 'see', 'look', 'eat', 'drink', 'sleep', 'play', 'like', 'want']),
('verbs', 4, 6, ARRAY['run', 'jump', 'walk', 'talk', 'read', 'write', 'draw', 'sing', 'dance', 'help']),
('verbs', 7, 10, ARRAY['think', 'know', 'feel', 'make', 'take', 'give', 'find', 'tell', 'ask', 'work']),
('verbs', 11, 14, ARRAY['create', 'build', 'design', 'develop', 'learn', 'teach', 'study', 'practice', 'improve', 'achieve']),
('verbs', 15, 18, ARRAY['analyze', 'evaluate', 'synthesize', 'collaborate', 'communicate', 'negotiate', 'facilitate', 'coordinate', 'implement', 'manage']);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('nouns', 0, 3, ARRAY['mom', 'dad', 'baby', 'dog', 'cat', 'ball', 'toy', 'book', 'car', 'house']),
('nouns', 4, 6, ARRAY['school', 'teacher', 'friend', 'family', 'water', 'food', 'tree', 'flower', 'sun', 'moon']),
('nouns', 7, 10, ARRAY['computer', 'phone', 'game', 'movie', 'music', 'animal', 'bird', 'fish', 'city', 'country']),
('nouns', 11, 14, ARRAY['science', 'history', 'math', 'art', 'language', 'technology', 'environment', 'community', 'government', 'society']),
('nouns', 15, 18, ARRAY['philosophy', 'psychology', 'economics', 'literature', 'engineering', 'medicine', 'architecture', 'agriculture', 'industry', 'commerce']);

INSERT INTO public.vocabulary_lists (category, min_age_level, max_age_level, words) VALUES
('adjectives', 0, 3, ARRAY['big', 'small', 'hot', 'cold', 'good', 'bad', 'happy', 'sad', 'new', 'old']),
('adjectives', 4, 6, ARRAY['fast', 'slow', 'loud', 'quiet', 'clean', 'dirty', 'pretty', 'ugly', 'hard', 'soft']),
('adjectives', 7, 10, ARRAY['easy', 'difficult', 'important', 'interesting', 'boring', 'funny', 'serious', 'smart', 'strong', 'weak']),
('adjectives', 11, 14, ARRAY['beautiful', 'handsome', 'intelligent', 'creative', 'brave', 'kind', 'honest', 'patient', 'generous', 'polite']),
('adjectives', 15, 18, ARRAY['ambitious', 'confident', 'determined', 'enthusiastic', 'flexible', 'innovative', 'logical', 'meticulous', 'optimistic', 'resourceful']);
