// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";

interface ChatRequest {
  sessionId: string;
  message: string;
}

interface Evaluation {
  targetMet: boolean;
  score: number;
}

interface ChatResponse {
  reply: string;
  evaluation: Evaluation;
  tokens: number;
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

function getVocabularyForAge(ageLevel: number): string[] {
  return [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
}

function isAllowedVocabulary(text: string, ageLevel: number): boolean {
  const allowedWords = getVocabularyForAge(ageLevel);
  
  const words = text.toLowerCase().split(/\s+/).map(word => 
    word.replace(/[.,!?;:'"()]/g, '')
  ).filter(word => word.length > 0);
  
  return words.every(word => allowedWords.includes(word));
}

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const requestData: ChatRequest = await req.json();
    const { sessionId, message } = requestData;

    if (!sessionId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const ageLevel = 0; // Default to age 0 for MVP

    if (!isAllowedVocabulary(message, ageLevel)) {
      return new Response(
        JSON.stringify({ 
          error: "Forbidden vocabulary",
          message: "Your message contains words that are not allowed for your age level."
        }),
        { 
          status: 403,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant teaching English to a very young child (age level: ${ageLevel}).
          Use only simple words appropriate for this age. 
          Respond with short, encouraging messages.
          Only use the following words: ${getVocabularyForAge(ageLevel).join(", ")}.
          Keep responses under 20 words.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 100,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Sorry, I don't understand.";
    const tokens = chatCompletion.usage?.total_tokens || 0;

    const targetWords = [...COLOR_WORDS_BASIC, ...NUMBER_WORDS_BASIC, ...GREETING_WORDS_BASIC];
    const userWords = message.toLowerCase().split(/\s+/).map(word => 
      word.replace(/[.,!?;:'"()]/g, '')
    ).filter(word => word.length > 0);
    
    const matchedWords = userWords.filter(word => targetWords.includes(word));
    const targetMet = matchedWords.length > 0;
    const score = matchedWords.length * 5; // 5 points per matched word

    const response: ChatResponse = {
      reply,
      evaluation: {
        targetMet,
        score
      },
      tokens
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
    console.error("Error processing chat request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: error.message
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
