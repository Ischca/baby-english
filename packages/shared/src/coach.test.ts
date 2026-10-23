import { afterEach, describe, expect, it, vi } from "vitest";
import {
  callCoach,
  configureCoach,
  evaluateWithCoach,
  hasCoach,
  transcribe,
} from "./coach.ts";
const request = {
  missionId: "first-hello",
  route: "baby" as const,
  step: 0,
  answer: "Hi",
  history: [],
};
afterEach(() => {
  configureCoach(null);
  vi.unstubAllGlobals();
});
describe("coach transport", () => {
  it("does not send a fake anonymous token or call the API when unconfigured", async () => {
    expect(hasCoach()).toBe(false);
    await expect(evaluateWithCoach(request)).rejects.toThrow("AI接続");
  });
  it("uses a session token and validates the external response", async () => {
    configureCoach({
      url: "https://project.example",
      key: "public-key",
      token: async () => "real-session",
    });
    const fetcher = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            accepted: true,
            feedback: "Good",
            recast: "Hi",
            source: "ai",
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal("fetch", fetcher);
    expect((await evaluateWithCoach(request)).accepted).toBe(true);
    expect(fetcher).toHaveBeenCalledWith(
      "https://project.example/functions/v1/coach",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer real-session",
        }),
      }),
    );
    fetcher.mockResolvedValueOnce(new Response("{}"));
    await expect(evaluateWithCoach(request)).rejects.toThrow();
  });
  it("surfaces budget, authentication and server failures without treating them as wrong answers", async () => {
    configureCoach({
      url: "https://project.example",
      key: "public-key",
      token: async () => "token",
    });
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    for (const [status, text] of [
      [429, "利用上限"],
      [401, "認証"],
      [503, "接続できません"],
    ] as const) {
      fetcher.mockResolvedValueOnce(new Response("{}", { status }));
      await expect(evaluateWithCoach(request)).rejects.toThrow(text);
    }
    fetcher.mockRejectedValueOnce(new DOMException("Timeout", "AbortError"));
    await expect(evaluateWithCoach(request)).rejects.toThrow("タイムアウト");
  });
  it("passes multipart audio without forcing a JSON header", async () => {
    configureCoach({
      url: "https://project.example",
      key: "public-key",
      token: async () => "token",
    });
    const fetcher = vi.fn(async () => new Response('{"text":"Hello"}'));
    vi.stubGlobal("fetch", fetcher);
    const form = new FormData();
    form.append("file", new Blob(["audio"]));
    expect(await transcribe(form)).toBe("Hello");
    const opts = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(
      (opts[1].headers as Record<string, string>)["Content-Type"],
    ).toBeUndefined();
    await callCoach("transcribe", form);
  });
});
