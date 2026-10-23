import { z } from "zod";
import { cors, json } from "../_shared/handler.ts";
import { services } from "../_shared/runtime.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const bearer = req.headers
      .get("authorization")
      ?.match(/^Bearer (.+)$/i)?.[1];
    if (!bearer) return json({ error: "Authentication required" }, 401);
    const service = services();
    const user = await service.authenticate(bearer);
    if (!user) return json({ error: "Invalid session" }, 401);
    if (Number(req.headers.get("content-length")) > 3000000)
      return json({ error: "Audio too large" }, 413);
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 2500000 ||
      file.size === 0 ||
      ![
        "audio/mp4",
        "audio/m4a",
        "audio/x-m4a",
        "audio/webm",
        "audio/wav",
        "audio/mpeg",
      ].includes(file.type)
    )
      return json({ error: "Invalid audio file" }, 400);
    if (!(await service.rateLimit(user)))
      return json({ error: "Daily limit reached" }, 429);
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "Transcription not configured" }, 503);
    const upstream = new FormData();
    upstream.append("file", file);
    upstream.append("model", "whisper-1");
    upstream.append("language", "en");
    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${key}` },
        body: upstream,
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!response.ok) throw new Error("Transcription failed");
    return json(
      z
        .object({ text: z.string().trim().min(1).max(500) })
        .parse(await response.json()),
    );
  } catch {
    return json({ error: "Transcription temporarily unavailable" }, 503);
  }
});
