
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const missions: Mission[] = [
      {
        id: 'colors',
        name: 'Colors',
        description: 'Learn to identify and name different colors in English.',
        vocabulary: COLOR_WORDS_BASIC,
      },
      {
        id: 'numbers',
        name: 'Numbers',
        description: 'Count and recognize numbers from one to ten.',
        vocabulary: NUMBER_WORDS_BASIC,
      },
      {
        id: 'greetings',
        name: 'Greetings',
        description: 'Practice common greetings and polite expressions.',
        vocabulary: GREETING_WORDS_BASIC,
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
