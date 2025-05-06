// @ts-nocheck
// Deno Edge Function shared schema definitions. Remote imports are resolved at runtime by Deno.

import { z } from 'https://esm.sh/zod@3.22.4?dts';

export const UserSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  age_level: z.number().int().min(0).max(18).default(0),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable(),
});

export type Session = z.infer<typeof SessionSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  token_count: z.number().int().optional(),
  created_at: z.string().datetime().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ScoreSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  mission: z.string(),
  target_words: z.array(z.string()),
  success: z.boolean(),
  score: z.number().int(),
});

export type Score = z.infer<typeof ScoreSchema>;

export const ChatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string(),
  userId: z.string().uuid().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const EvaluationSchema = z.object({
  targetMet: z.boolean(),
  score: z.number().int(),
});

export const ChatResponseSchema = z.object({
  reply: z.string(),
  evaluation: EvaluationSchema,
  tokens: z.number().int(),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type Evaluation = z.infer<typeof EvaluationSchema>;
