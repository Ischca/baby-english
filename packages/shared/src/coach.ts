import { z } from "zod";
import { FeedbackSchema, RouteSchema, TurnSchema } from "./learning/types.ts";

export const CoachRequestSchema = z.object({
  missionId: z.string().min(1).max(80),
  route: RouteSchema,
  step: z.number().int().min(0).max(3),
  answer: z.string().trim().min(1).max(500),
  history: z.array(TurnSchema).max(3),
});
export type CoachRequest = z.infer<typeof CoachRequestSchema>;
export const CoachResponseSchema = FeedbackSchema.extend({
  source: z.literal("ai"),
});
export const TranscriptionSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

let connection: {
  url: string;
  key: string;
  token: () => Promise<string>;
} | null = null;
export function configureCoach(config: typeof connection) {
  connection = config;
}
export function hasCoach() {
  return connection !== null;
}
export async function callCoach(
  endpoint: "coach" | "transcribe",
  body: unknown,
): Promise<unknown> {
  if (!connection)
    throw new Error(
      "AI接続が設定されていません。例文練習はそのまま利用できます。",
    );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const token = await connection.token();
    const response = await fetch(`${connection.url}/functions/v1/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: connection.key,
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 429)
        throw new Error(
          "今日のAI利用上限に達しました。例文練習は続けられます。",
        );
      if (response.status === 401)
        throw new Error(
          "認証を更新できませんでした。接続を確認して、もう一度お試しください。",
        );
      throw new Error(
        "AIに接続できませんでした。もう一度試すか、例文練習に切り替えられます。",
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw new Error(
        "AIの応答がタイムアウトしました。回答は残っています。もう一度お試しください。",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export async function evaluateWithCoach(request: CoachRequest) {
  return CoachResponseSchema.parse(
    await callCoach("coach", CoachRequestSchema.parse(request)),
  );
}
export async function transcribe(form: FormData) {
  return TranscriptionSchema.parse(await callCoach("transcribe", form)).text;
}
