import { z } from "zod";

export const RouteSchema = z.enum(["baby", "real"]);
export type LifeRoute = z.infer<typeof RouteSchema>;
export const ProfileSchema = z.object({
  name: z.string().trim().min(1).max(24),
  route: RouteSchema,
  focus: z.enum(["everyday", "work", "travel"]),
  dailyMinutes: z.union([z.literal(10), z.literal(20), z.literal(30)]),
  placement: z.number().int().min(0).max(2),
});
export type Profile = z.infer<typeof ProfileSchema>;
export const FeedbackSchema = z.object({
  accepted: z.boolean(),
  feedback: z.string().min(1).max(500),
  recast: z.string().max(300),
  source: z.enum(["practice", "ai"]),
});
export type Feedback = z.infer<typeof FeedbackSchema>;
export const TurnSchema = z.object({
  step: z.number().int().min(0).max(3),
  prompt: z.string().max(500),
  answer: z.string().trim().min(1).max(500),
  helped: z.boolean(),
  input: z.enum(["text", "voice", "choice"]),
  feedback: FeedbackSchema,
});
export type Turn = z.infer<typeof TurnSchema>;
export const ActiveLessonSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().min(1),
  route: RouteSchema,
  startedAt: z.string().datetime(),
  hintedSteps: z.array(z.number().int().min(0).max(3)).max(4).default([]),
  turns: z.array(TurnSchema).max(4),
});
export type ActiveLesson = z.infer<typeof ActiveLessonSchema>;
export const LessonResultSchema = ActiveLessonSchema.extend({
  endedAt: z.string().datetime(),
  passed: z.boolean(),
  score: z.number().int().min(0).max(100),
  xp: z.number().int().min(0).max(60),
});
export type LessonResult = z.infer<typeof LessonResultSchema>;
export const ReviewCardSchema = z.object({
  id: z.string(),
  missionId: z.string(),
  cue: z.string(),
  phrase: z.string(),
  dueAt: z.string().datetime(),
  interval: z.number().int().min(0).max(30),
  repetitions: z.number().int().min(0),
  lapses: z.number().int().min(0),
});
export type ReviewCard = z.infer<typeof ReviewCardSchema>;
export const ProgressSchema = z.object({
  version: z.literal(2),
  profile: ProfileSchema.nullable(),
  active: ActiveLessonSchema.nullable(),
  history: z.array(LessonResultSchema).max(1000),
  reviews: z.array(ReviewCardSchema).max(1000),
  mastered: z.array(z.string()).max(100),
  xp: z.number().int().nonnegative(),
  xpByMission: z
    .record(z.string(), z.number().int().min(0).max(60))
    .default({}),
  activity: z.record(z.string(), z.number().int().nonnegative()),
  updatedAt: z.string().datetime(),
});
export type Progress = z.infer<typeof ProgressSchema>;

export interface Scene {
  title: string;
  setting: string;
  partner: string;
  prompts: [string, string, string, string];
}
export interface Step {
  cue: string;
  example: string;
  alternatives: string[];
  choices?: [string, string, string];
}
export interface Mission {
  id: string;
  stage: number;
  skill: string;
  icon: string;
  minutes: number;
  baby: Scene;
  real: Scene;
  steps: [Step, Step, Step, Step];
}
