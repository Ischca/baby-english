
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

interface Mission {
  id: string;
  name: string;
  description: string;
  vocabulary: string[];
}

interface MissionsResponse {
  missions: Mission[];
}

const COLOR_WORDS_BASIC = [
  'red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown'
];

const NUMBER_WORDS_BASIC = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'
];

const GREETING_WORDS_BASIC = [
  'hi', 'hello', 'bye', 'goodbye', 'yes', 'no', 'please', 'thank you', 'sorry', 'good'
];

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get vocabulary for a specific category and age level
 * @param category The vocabulary category (colors, numbers, greetings)
 * @param ageLevel The user's age level (0-18)
 * @returns Array of words for the specified category and age level
 */
async function getVocabularyByCategory(category: string, ageLevel: number): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('vocabulary_lists')
      .select('words')
      .eq('category', category)
      .lte('min_age_level', ageLevel)
      .gte('max_age_level', ageLevel)
      .single();
    
    if (error) {
      console.error('Error fetching vocabulary:', error);
      switch (category) {
        case 'colors':
          return COLOR_WORDS_BASIC;
        case 'numbers':
          return NUMBER_WORDS_BASIC;
        case 'greetings':
          return GREETING_WORDS_BASIC;
        default:
          return [];
      }
    }
    
    if (data && data.words) {
      return data.words as string[];
    }
    
    switch (category) {
      case 'colors':
        return COLOR_WORDS_BASIC;
      case 'numbers':
        return NUMBER_WORDS_BASIC;
      case 'greetings':
        return GREETING_WORDS_BASIC;
      default:
        return [];
    }
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    switch (category) {
      case 'colors':
        return COLOR_WORDS_BASIC;
      case 'numbers':
        return NUMBER_WORDS_BASIC;
      case 'greetings':
        return GREETING_WORDS_BASIC;
      default:
        return [];
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const ageLevel = parseInt(url.searchParams.get('ageLevel') || '0', 10);

    const colorsVocabulary = await getVocabularyByCategory('colors', ageLevel);
    const numbersVocabulary = await getVocabularyByCategory('numbers', ageLevel);
    const greetingsVocabulary = await getVocabularyByCategory('greetings', ageLevel);

    const missions: Mission[] = [
      {
        id: 'colors',
        name: 'Colors',
        description: 'Learn to identify and name different colors in English.',
        vocabulary: colorsVocabulary,
      },
      {
        id: 'numbers',
        name: 'Numbers',
        description: 'Count and recognize numbers.',
        vocabulary: numbersVocabulary,
      },
      {
        id: 'greetings',
        name: 'Greetings',
        description: 'Practice common greetings and polite expressions.',
        vocabulary: greetingsVocabulary,
      }
    ];

    const response: MissionsResponse = {
      missions
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error) {
    console.error("Error processing missions request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
