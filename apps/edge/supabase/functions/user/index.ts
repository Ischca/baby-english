import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { UserSchema } from "shared/src/schema";

interface UserUpdateRequest {
  userId: string;
  ageLevel: number;
}

interface UserResponse {
  id: string;
  ageLevel: number;
  updated: boolean;
}

const mockUsers = new Map<string, { id: string, ageLevel: number }>();

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

  if (req.method === "GET") {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      
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
      
      let user = mockUsers.get(userId);
      
      if (!user) {
        user = { id: userId, ageLevel: 0 };
        mockUsers.set(userId, user);
      }
      
      return new Response(
        JSON.stringify({ 
          id: user.id,
          ageLevel: user.ageLevel
        }),
        { 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    } catch (error) {
      console.error("Error processing user GET request:", error);
      
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
  
  if (req.method === "POST") {
    try {
      const requestData: UserUpdateRequest = await req.json();
      
      if (!requestData.userId) {
        return new Response(
          JSON.stringify({ error: "Missing userId in request body" }),
          { 
            status: 400,
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
      
      let user = mockUsers.get(requestData.userId);
      
      if (!user) {
        user = { id: requestData.userId, ageLevel: 0 };
      }
      
      if (typeof requestData.ageLevel === 'number') {
        if (requestData.ageLevel < 0 || requestData.ageLevel > 18) {
          return new Response(
            JSON.stringify({ error: "Age level must be between 0 and 18" }),
            { 
              status: 400,
              headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            }
          );
        }
        
        user.ageLevel = requestData.ageLevel;
      }
      
      mockUsers.set(requestData.userId, user);
      
      const response: UserResponse = {
        id: user.id,
        ageLevel: user.ageLevel,
        updated: true
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
      console.error("Error processing user POST request:", error);
      
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
        "Allow": "GET, POST, OPTIONS"
      }
    }
  );
});
