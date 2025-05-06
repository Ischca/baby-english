import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { v4 as uuidv4 } from 'https://deno.land/std@0.220.1/uuid/mod.ts';
import {
  SessionSchema,
  MessageSchema,
  ScoreSchema,
} from '../_shared/schema.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get sessions for a user from the database
 * @param userId The user's ID
 * @param limit Maximum number of sessions to return
 * @param offset Number of sessions to skip
 * @returns Array of sessions and total count
 */
async function getUserSessions(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ sessions: any[]; totalCount: number }> {
  try {
    const { count, error: countError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting sessions:', countError);
      return { sessions: [], totalCount: 0 };
    }

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sessions:', error);
      return { sessions: [], totalCount: 0 };
    }

    return {
      sessions: sessions || [],
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return { sessions: [], totalCount: 0 };
  }
}

/**
 * Get messages for a session from the database
 * @param sessionId The session ID
 * @returns Array of messages
 */
async function getSessionMessages(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return [];
  }
}

/**
 * Get scores for a session from the database
 * @param sessionId The session ID
 * @returns Array of scores
 */
async function getSessionScores(sessionId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching scores:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching session scores:', error);
    return [];
  }
}

/**
 * Get a session by ID from the database
 * @param sessionId The session ID
 * @returns The session object or null if not found
 */
async function getSessionById(sessionId: string): Promise<any | null> {
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

    return data;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Format session data for API response
 * @param session The session object
 * @param messages Array of messages
 * @param scores Array of scores
 * @returns Formatted session data
 */
function formatSessionData(session: any, messages: any[], scores: any[]): any {
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);

  return {
    id: session.id,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    missionType: session.mission_type,
    messageCount: messages.length,
    totalScore,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);

  if (path.length > 0 && path[path.length - 1] === 'export') {
    if (req.method === 'POST') {
      try {
        const requestData = await req.json();
        const { sessionId, format = 'json' } = requestData;

        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: 'Missing sessionId in request body' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        const session = await getSessionById(sessionId);
        if (!session) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        const messages = await getSessionMessages(sessionId);
        const scores = await getSessionScores(sessionId);

        const exportData = {
          session: {
            id: session.id,
            userId: session.user_id,
            startedAt: session.started_at,
            endedAt: session.ended_at,
            missionType: session.mission_type,
          },
          messages: messages.map((msg) => ({
            id: msg.id,
            sessionId: msg.session_id,
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at,
          })),
          scores: scores.map((score) => ({
            id: score.id,
            sessionId: score.session_id,
            mission: score.mission,
            targetWords: score.target_words,
            success: score.success,
            score: score.score,
          })),
          exportedAt: new Date().toISOString(),
        };

        const exportUrl = `https://example.com/exports/${sessionId}.${format}`;

        return new Response(
          JSON.stringify({
            sessionId,
            exportUrl,
            format,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (error) {
        console.error('Error processing export request:', error);

        return new Response(
          JSON.stringify({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Allow: 'POST, OPTIONS',
      },
    });
  }

  if (req.method === 'GET') {
    try {
      const userId = url.searchParams.get('userId');
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const offset = parseInt(url.searchParams.get('offset') || '0', 10);

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      const { sessions, totalCount } = await getUserSessions(
        userId,
        limit,
        offset
      );

      const formattedSessions = await Promise.all(
        sessions.map(async (session) => {
          const messages = await getSessionMessages(session.id);
          const scores = await getSessionScores(session.id);
          return formatSessionData(session, messages, scores);
        })
      );

      return new Response(
        JSON.stringify({
          sessions: formattedSessions,
          totalCount,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error) {
      console.error('Error processing sessions request:', error);

      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Allow: 'GET, OPTIONS',
    },
  });
});
