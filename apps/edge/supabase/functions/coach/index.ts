import { z } from "zod";
import {
  createCoachHandler,
  evaluationMessages,
  json,
} from "../_shared/handler.ts";
import { services } from "../_shared/runtime.ts";
import { FeedbackSchema } from "../../../../../packages/shared/src/learning/types.ts";

const completion = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string().nullable() }),
        finish_reason: z.string(),
      }),
    )
    .min(1),
});
Deno.serve(async (req: Request) => {
  try {
    const handler = createCoachHandler({
      ...services(),
      async evaluate(input) {
        const key = Deno.env.get("OPENAI_API_KEY");
        if (!key) throw new Error("Tutor not configured");
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(20000),
            body: JSON.stringify({
              model: Deno.env.get("OPENAI_MODEL") || "gpt-4o",
              messages: evaluationMessages(input),
              max_completion_tokens: 500,
              response_format: {
                type: "json_schema",
                json_schema: {
                  name: "lesson_feedback",
                  strict: true,
                  schema: {
                    type: "object",
                    properties: {
                      accepted: { type: "boolean" },
                      feedback: { type: "string" },
                      recast: { type: "string" },
                    },
                    required: ["accepted", "feedback", "recast"],
                    additionalProperties: false,
                  },
                },
              },
            }),
          },
        );
        if (!response.ok) throw new Error("Tutor upstream unavailable");
        const result = completion.parse(await response.json()).choices[0]!;
        if (result.finish_reason !== "stop" || !result.message.content)
          throw new Error("Incomplete tutor response");
        return FeedbackSchema.parse({
          ...JSON.parse(result.message.content),
          source: "ai",
        });
      },
    });
    return await handler(req);
  } catch {
    return json({ error: "Tutor is not configured" }, 503);
  }
});
