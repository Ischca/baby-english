import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SessionSchema, MessageSchema, ScoreSchema } from "shared/src/schema";

const mockSessions = new Map<string, {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  missionType: string;
}>();

const mockMessages = new Map<string, Array<{
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}>>();

const mockScores = new Map<string, Array<{
  id: string;
  sessionId: string;
  mission: string;
  targetWords: string[];
  success: boolean;
  score: number;
}>>();

function initializeMockData() {
  const session1Id = crypto.randomUUID();
  const session1 = {
    id: session1Id,
    userId: "user-123",
    startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    endedAt: new Date(Date.now() - 3000000).toISOString(),   // 50 minutes ago
    missionType: "colors"
  };
  mockSessions.set(session1Id, session1);
  
  mockMessages.set(session1Id, [
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      role: 'assistant',
      content: "Let's learn colors! Can you say a color?",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      role: 'user',
      content: "Red!",
      createdAt: new Date(Date.now() - 3550000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      role: 'assistant',
      content: "Yes, red is a color! Can you say another color?",
      createdAt: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      role: 'user',
      content: "Blue!",
      createdAt: new Date(Date.now() - 3450000).toISOString()
    }
  ]);
  
  mockScores.set(session1Id, [
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      mission: "colors",
      targetWords: ["red"],
      success: true,
      score: 5
    },
    {
      id: crypto.randomUUID(),
      sessionId: session1Id,
      mission: "colors",
      targetWords: ["blue"],
      success: true,
      score: 5
    }
  ]);
  
  const session2Id = crypto.randomUUID();
  const session2 = {
    id: session2Id,
    userId: "user-123",
    startedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    endedAt: new Date(Date.now() - 84600000).toISOString(),   // 23.5 hours ago
    missionType: "numbers"
  };
  mockSessions.set(session2Id, session2);
  
  mockMessages.set(session2Id, [
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      role: 'assistant',
      content: "Let's count together! Do you know any numbers?",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      role: 'user',
      content: "One!",
      createdAt: new Date(Date.now() - 86350000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      role: 'assistant',
      content: "Great! One is the first number. Can you say another number?",
      createdAt: new Date(Date.now() - 86300000).toISOString()
    },
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      role: 'user',
      content: "Two!",
      createdAt: new Date(Date.now() - 86250000).toISOString()
    }
  ]);
  
  mockScores.set(session2Id, [
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      mission: "numbers",
      targetWords: ["one"],
      success: true,
      score: 5
    },
    {
      id: crypto.randomUUID(),
      sessionId: session2Id,
      mission: "numbers",
      targetWords: ["two"],
      success: true,
      score: 5
    }
  ]);
}

initializeMockData();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);
  
  if (path.length > 0 && path[path.length - 1] === 'export') {
    if (req.method === "POST") {
      try {
        const requestData = await req.json();
        const { sessionId, format = 'json' } = requestData;
        
        if (!sessionId) {
          return new Response(
            JSON.stringify({ error: "Missing sessionId in request body" }),
            { 
              status: 400,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        
        const session = mockSessions.get(sessionId);
        if (!session) {
          return new Response(
            JSON.stringify({ error: "Session not found" }),
            { 
              status: 404,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        
        const messages = mockMessages.get(sessionId) || [];
        
        const scores = mockScores.get(sessionId) || [];
        
        const exportData = {
          session,
          messages,
          scores,
          exportedAt: new Date().toISOString()
        };
        
        const exportUrl = `https://example.com/exports/${sessionId}.${format}`;
        
        return new Response(
          JSON.stringify({
            sessionId,
            exportUrl,
            format
          }),
          { 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      } catch (error) {
        console.error("Error processing export request:", error);
        
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
    }
    
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Allow": "POST, OPTIONS"
        }
      }
    );
  }
  
  if (req.method === "GET") {
    try {
      const userId = url.searchParams.get("userId");
      const limit = parseInt(url.searchParams.get("limit") || "10", 10);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId parameter" }),
          { 
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
      
      const userSessions = Array.from(mockSessions.values())
        .filter(session => session.userId === userId)
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      
      const paginatedSessions = userSessions.slice(offset, offset + limit);
      
      const formattedSessions = paginatedSessions.map(session => {
        const sessionMessages = mockMessages.get(session.id) || [];
        const sessionScores = mockScores.get(session.id) || [];
        
        const totalScore = sessionScores.reduce((sum, score) => sum + score.score, 0);
        
        return {
          id: session.id,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          missionType: session.missionType,
          messageCount: sessionMessages.length,
          totalScore
        };
      });
      
      return new Response(
        JSON.stringify({
          sessions: formattedSessions,
          totalCount: userSessions.length
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    } catch (error) {
      console.error("Error processing sessions request:", error);
      
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
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { 
      status: 405,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Allow": "GET, OPTIONS"
      }
    }
  );
});
