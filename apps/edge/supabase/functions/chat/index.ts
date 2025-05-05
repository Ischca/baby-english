// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { v4 as uuidv4 } from "https://deno.land/std@0.220.1/uuid/mod.ts";
import { 
  getVocabularyForAge as getVocabularyForAgeShared,
  getVocabularyByCategory,
  VocabularyCategory
} from "../../../../../packages/shared/src/wordlists.ts";

interface ChatRequest {
  sessionId: string;
  message: string;
  userId?: string;
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

interface Session {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  mission_type: string;
}

interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  token_count?: number;
  created_at: string;
}

interface Score {
  id: string;
  session_id: string;
  mission: string;
  target_words: string[];
  success: boolean;
  score: number;
  created_at: string;
}

interface User {
  id: string;
  age_level: number;
  created_at: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get vocabulary for a specific age level
 * @param ageLevel The user's age level (0-18)
 * @returns Array of words appropriate for the age level
 */
async function getVocabularyForAge(ageLevel: number): Promise<string[]> {
  try {
    return await getVocabularyForAgeShared(ageLevel, supabase);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return getVocabularyForAgeShared(ageLevel);
  }
}

/**
 * Get user data from the database
 * @param userId The user ID
 * @returns User object or null if not found
 */
async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get session data from the database
 * @param sessionId The session ID
 * @returns Session object or null if not found
 */
async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }
    
    return data as Session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Save a message to the database
 * @param message The message to save
 * @returns True if successful, false otherwise
 */
async function saveMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        id: uuidv4(),
        session_id: message.session_id,
        role: message.role,
        content: message.content,
        token_count: message.token_count
      });
    
    if (error) {
      console.error('Error saving message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    return false;
  }
}

/**
 * Save a score to the database
 * @param score The score to save
 * @returns True if successful, false otherwise
 */
async function saveScore(score: Omit<Score, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scores')
      .insert({
        id: uuidv4(),
        session_id: score.session_id,
        mission: score.mission,
        target_words: score.target_words,
        success: score.success,
        score: score.score
      });
    
    if (error) {
      console.error('Error saving score:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
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
    const { sessionId, message, userId } = requestData;

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

    const session = await getSession(sessionId);
    
    let ageLevel = 0; // Default to age 0
    if (userId) {
      const user = await getUser(userId);
      if (user) {
        ageLevel = user.age_level;
      }
    }

    const vocabulary = await getVocabularyForAge(ageLevel);

    await saveMessage({
      session_id: sessionId,
      role: 'user',
      content: message
    });

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant teaching English to a child (age level: ${ageLevel}).
          Use only simple words appropriate for this age. 
          Respond with short, encouraging messages.
          Only use the following words: ${vocabulary.join(", ")}.
          Keep responses under 20 words.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 100,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Sorry, I don't understand.";
    const tokens = chatCompletion.usage?.total_tokens || 0;

    await saveMessage({
      session_id: sessionId,
      role: 'assistant',
      content: reply,
      token_count: tokens
    });

    const missionType = session?.mission_type || 'general';

    let targetWords: string[] = [];
    try {
      targetWords = await getVocabularyByCategory(
        missionType as VocabularyCategory, 
        ageLevel, 
        supabase
      );
    } catch (error) {
      console.error('Error fetching target words:', error);
      targetWords = await getVocabularyForAgeShared(ageLevel);
    }

    const userWords = message.toLowerCase().split(/\s+/).map(word => 
      word.replace(/[.,!?;:'"()]/g, '')
    ).filter(word => word.length > 0);
    
    const matchedWords = userWords.filter(word => targetWords.includes(word));
    const targetMet = matchedWords.length > 0;
    const score = matchedWords.length * 5; // 5 points per matched word

    if (targetMet) {
      await saveScore({
        session_id: sessionId,
        mission: missionType,
        target_words: matchedWords,
        success: targetMet,
        score: score
      });
    }

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
