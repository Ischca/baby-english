import { describe, expect, it } from "vitest";
import { emptyProgress } from "./engine.ts";
import { createProgressStorage, exportAnki, parseProgress } from "./storage.ts";
describe("device storage", () => {
  it("validates backups and refuses invalid data without overwriting it", async () => {
    expect(() => parseProgress("{bad")).toThrow();
    expect(() => parseProgress("x".repeat(5000001))).toThrow();
    expect(() =>
      parseProgress(
        JSON.stringify({ ...emptyProgress(), mastered: ["missing"] }),
      ),
    ).toThrow();
    let raw = "corrupt";
    const storage = createProgressStorage({
      getItem: async () => raw,
      setItem: async (_, value) => {
        raw = value;
      },
      removeItem: async () => undefined,
    });
    await expect(storage.load()).rejects.toThrow();
    expect(raw).toBe("corrupt");
    const p = emptyProgress();
    await storage.save(p);
    expect(await storage.load()).toEqual(p);
  });
  it("serialises writes and recovers from a rejected write", async () => {
    const values: string[] = [];
    let first = true;
    const storage = createProgressStorage({
      getItem: async () => null,
      setItem: async (_, value) => {
        if (first) {
          first = false;
          throw new Error("Quota");
        }
        values.push(value);
      },
      removeItem: async () => undefined,
    });
    expect(await storage.load()).toBeNull();
    const p = emptyProgress();
    const a = storage.save(p);
    const b = storage.save({ ...p, xp: 1 });
    await expect(a).rejects.toThrow("Quota");
    await b;
    expect(JSON.parse(values[0]!).xp).toBe(1);
  });
  it("rejects unknown or nonsequential active lessons", () => {
    const base = {
      id: "e1818370-d33c-4e05-99df-442a8d2f4a55",
      missionId: "missing",
      route: "baby",
      startedAt: new Date().toISOString(),
      turns: [],
    };
    expect(() =>
      parseProgress(JSON.stringify({ ...emptyProgress(), active: base })),
    ).toThrow();
    base.missionId = "first-hello";
    expect(
      parseProgress(JSON.stringify({ ...emptyProgress(), active: base })).active
        ?.hintedSteps,
    ).toEqual([]);
    expect(() =>
      parseProgress(
        JSON.stringify({
          ...emptyProgress(),
          active: {
            ...base,
            turns: [
              {
                step: 1,
                prompt: "Hi",
                answer: "Hi",
                helped: false,
                input: "text",
                feedback: {
                  accepted: true,
                  feedback: "Good",
                  recast: "Hi",
                  source: "practice",
                },
              },
            ],
          },
        }),
      ),
    ).toThrow();
  });
  it("exports review cards as safe three-column Anki TSV", () => {
    const p = emptyProgress();
    p.reviews = [
      {
        id: "1",
        missionId: "first-hello",
        cue: "お礼\nを言う",
        phrase: "<Thanks>\t!",
        dueAt: new Date().toISOString(),
        interval: 1,
        repetitions: 0,
        lapses: 0,
      },
    ];
    const text = exportAnki(p);
    expect(text).toContain("#separator:Tab");
    expect(text.split("\n")[2]!.split("\t")).toHaveLength(3);
    expect(text).not.toContain("<Thanks>");
  });
});
