import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { v4 as uuidv4 } from "https://deno.land/std@0.220.1/uuid/mod.ts";
import { UserSchema } from '@shared/schema.ts';

interface UserUpdateRequest {
  userId: string;
  ageLevel?: number;
}

interface UserResponse {
  id: string;
  ageLevel: number;
  updated?: boolean;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get a user by ID from the database
 * @param userId The user's ID
 * @returns The user object or null if not found
 */
async function getUserById(userId: string): Promise<{ id: string; age_level: number } | null> {
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
    
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Create a new user in the database
 * @param userId The user's ID (optional, will generate UUID if not provided)
 * @param ageLevel The user's age level (default: 0)
 * @returns The created user object or null if creation failed
 */
async function createUser(userId?: string, ageLevel: number = 0): Promise<{ id: string; age_level: number } | null> {
  try {
    const newUser = {
      id: userId || uuidv4(),
      age_level: ageLevel
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update a user's age level in the database
 * @param userId The user's ID
 * @param ageLevel The new age level
 * @returns The updated user object or null if update failed
 */
async function updateUserAgeLevel(userId: string, ageLevel: number): Promise<{ id: string; age_level: number } | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ age_level: ageLevel })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
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

  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');

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

      let user = await getUserById(userId);

      if (!user) {
        user = await createUser(userId);
        
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Failed to create user' }),
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

      return new Response(
        JSON.stringify({
          id: user.id,
          ageLevel: user.age_level,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (error) {
      console.error('Error processing user GET request:', error);

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

  if (req.method === 'POST') {
    try {
      const requestData: UserUpdateRequest = await req.json();

      if (!requestData.userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId in request body' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      let user = await getUserById(requestData.userId);

      if (!user) {
        user = await createUser(requestData.userId);
        
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'Failed to create user' }),
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

      let updated = false;

      if (typeof requestData.ageLevel === 'number') {
        if (requestData.ageLevel < 0 || requestData.ageLevel > 18) {
          return new Response(
            JSON.stringify({ error: 'Age level must be between 0 and 18' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        const updatedUser = await updateUserAgeLevel(requestData.userId, requestData.ageLevel);
        
        if (!updatedUser) {
          return new Response(
            JSON.stringify({ error: 'Failed to update user' }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }
        
        user = updatedUser;
        updated = true;
      }

      const response: UserResponse = {
        id: user.id,
        ageLevel: user.age_level,
        updated,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Error processing user POST request:', error);

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
      Allow: 'GET, POST, OPTIONS',
    },
  });
});
