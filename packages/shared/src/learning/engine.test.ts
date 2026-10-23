import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { missions, getMission } from "./curriculum.ts";
import {
  addTurn,
  completeLesson,
  configureProfile,
  dueReviews,
  emptyProgress,
  englishAge,
  evaluatePractice,
  isUnlocked,
  localDay,
  normalizeAnswer,
  placementStage,
  recommendedMission,
  reviewCard,
  sceneFor,
  startLesson,
  streak,
} from "./engine.ts";
import { type Profile, type Progress } from "./types.ts";
const now = new Date("2026-10-23T12:00:00.000Z");
const profile: Profile = {
  name: "Alex",
  route: "baby",
  focus: "everyday",
  dailyMinutes: 10,
  placement: 0,
};
const fresh = () => configureProfile(emptyProgress(now), profile, now);
function lesson(
  progress = fresh(),
  options: {
    id?: string;
    helped?: boolean;
    failed?: boolean;
    choice?: boolean;
  } = {},
): Progress {
  const p = startLesson(
    progress,
    options.id ?? "first-hello",
    randomUUID(),
    now,
  );
  const id = p.active!.id;
  const mission = getMission(p.active!.missionId)!;
  let current = p;
  for (let step = 0; step < 4; step++)
    current = addTurn(
      current,
      id,
      {
        step,
        prompt: mission.baby.prompts[step]!,
        answer: mission.steps[step]!.example,
        helped: options.helped ?? false,
        input: options.choice ? "choice" : "text",
        feedback: {
          accepted: !options.failed,
          feedback: "Good.",
          recast: mission.steps[step]!.example,
          source: "practice",
        },
      },
      now,
    );
  return current;
}
describe("curriculum and progression", () => {
  it("contains 18 unique missions with independent production and transfer turns for both routes", () => {
    expect(new Set(missions.map((m) => m.id)).size).toBe(18);
    for (const m of missions) {
      expect(m.steps).toHaveLength(4);
      expect(m.baby.prompts).toHaveLength(4);
      expect(m.real.prompts).toHaveLength(4);
      expect(m.steps[2].choices).toBeUndefined();
      expect(m.steps[3].choices).toBeUndefined();
      for (let i = 0; i < 4; i++)
        expect(evaluatePractice(m.id, i, m.steps[i]!.example).accepted).toBe(
          true,
        );
    }
  });
  it("starts at zero and makes placement conservative", () => {
    expect(englishAge(emptyProgress(now))).toBe(0);
    expect([0, 1, 2, 3, 4, 5].map(placementStage)).toEqual([0, 0, 1, 1, 2, 2]);
    const placed = configureProfile(fresh(), { ...profile, placement: 2 }, now);
    expect(englishAge(placed)).toBe(6);
    expect(placed.mastered).toEqual([]);
    expect(isUnlocked(missions[9]!, placed)).toBe(false);
  });
  it("does not unlock a later chapter from XP alone", () => {
    const p = { ...fresh(), xp: 999999 };
    expect(isUnlocked(missions[3]!, p)).toBe(false);
    p.mastered = missions.slice(0, 3).map((m) => m.id);
    expect(isUnlocked(missions[3]!, p)).toBe(true);
    expect(englishAge(p)).toBe(3);
    expect(() =>
      startLesson(fresh(), "give-an-update", randomUUID(), now),
    ).toThrow();
    expect(() =>
      startLesson(emptyProgress(), "first-hello", randomUUID(), now),
    ).toThrow();
    expect(() => startLesson(fresh(), "missing", randomUUID(), now)).toThrow();
  });
  it("prioritises useful repair and work skills within unlocked chapters", () => {
    expect(recommendedMission(fresh()).id).toBe("first-hello");
    const p = configureProfile(
      fresh(),
      { ...profile, focus: "work", placement: 2 },
      now,
    );
    expect(recommendedMission(p).id).toBe("ask-again");
    p.mastered = missions.slice(6, 9).map((m) => m.id);
    expect(recommendedMission(p).id).toBe("give-an-update");
    p.profile = { ...profile, placement: 2, focus: "travel" };
    p.mastered = [];
    expect(recommendedMission(p).id).toBe("make-a-plan");
    p.mastered = missions.map((m) => m.id);
    expect(recommendedMission(p).id).toBe("keep-talking");
    expect(englishAge(p)).toBe(18);
    expect(sceneFor(missions[0]!, "real").title).toBe("Your first hello");
  });
});
describe("lesson integrity", () => {
  it("requires all four turns and rejects duplicate or stale responses", () => {
    const p = lesson();
    const active = p.active!;
    expect(() => startLesson(p, "first-hello", randomUUID(), now)).toThrow();
    expect(() => addTurn(p, "stale", active.turns[0]!, now)).toThrow();
    expect(() => addTurn(p, active.id, active.turns[0]!, now)).toThrow();
    expect(() =>
      completeLesson(
        { ...p, active: { ...active, turns: active.turns.slice(0, 2) } },
        active.id,
        now,
      ),
    ).toThrow();
    expect(() => completeLesson(fresh(), active.id, now)).toThrow();
  });
  it("awards mastery for independent production and makes completion idempotent", () => {
    const p = lesson();
    const id = p.active!.id;
    const done = completeLesson(p, id, new Date(now.getTime() + 300000));
    expect(done.xp).toBe(60);
    expect(done.mastered).toEqual(["first-hello"]);
    expect(done.history[0]!.passed).toBe(true);
    expect(done.reviews).toHaveLength(2);
    expect(done.active).toBeNull();
    expect(completeLesson(done, id)).toBe(done);
    const again = lesson(done);
    const repeated = completeLesson(again, again.active!.id, now);
    expect(repeated.xp).toBe(60);
    expect(repeated.mastered).toHaveLength(1);
  });
  it("does not equate choices or hints with independent use; allows later mastery", () => {
    for (const options of [
      { helped: true },
      { choice: true },
      { failed: true },
    ]) {
      const p = lesson(fresh(), options);
      const done = completeLesson(p, p.active!.id, now);
      expect(done.mastered).toEqual([]);
      expect(done.xp).toBe(10);
    }
    const hinted = lesson(fresh(), { helped: true });
    const done = completeLesson(hinted, hinted.active!.id, now);
    const retry = lesson(done);
    const passed = completeLesson(retry, retry.active!.id, now);
    expect(passed.xp).toBe(60);
    expect(passed.history[0]!.xp).toBe(50);
  });
  it("honours persisted hints even if a caller forgets the helped flag", () => {
    let p = startLesson(fresh(), "first-hello", randomUUID(), now);
    p.active!.hintedSteps = [0];
    const id = p.active!.id;
    p = addTurn(p, id, {
      step: 0,
      prompt: "Hello!",
      answer: "Hi",
      helped: false,
      input: "text",
      feedback: evaluatePractice("first-hello", 0, "Hi"),
    });
    expect(p.active!.turns[0]!.helped).toBe(true);
  });
  it("retains the reward cap after old history is pruned", () => {
    const p = lesson();
    const done = completeLesson(p, p.active!.id, now);
    done.history = [];
    const replay = lesson(done);
    expect(completeLesson(replay, replay.active!.id, now).xp).toBe(60);
  });
  it("does not accept negations or keyword spam as correct", () => {
    expect(
      evaluatePractice("first-hello", 0, "hello hello hello").accepted,
    ).toBe(false);
    expect(
      evaluatePractice("ask-for-water", 2, "I do not want water").accepted,
    ).toBe(false);
    expect(evaluatePractice("first-hello", 0, "  HI!!! ").accepted).toBe(true);
    expect(normalizeAnswer("I’m tired.")).toBe("i am tired");
    expect(() => evaluatePractice("missing", 0, "hi")).toThrow();
    expect(() => evaluatePractice("first-hello", 4, "hi")).toThrow();
  });
});
describe("spaced review and daily activity", () => {
  it("schedules weak phrases sooner and refuses premature review rewards", () => {
    const p = lesson(fresh(), { failed: true });
    const done = completeLesson(p, p.active!.id, now);
    expect(dueReviews(done, now)).toHaveLength(0);
    const later = new Date(now.getTime() + 600001);
    expect(dueReviews(done, later)).toHaveLength(2);
    const card = done.reviews[0]!;
    expect(reviewCard(done, card.id, "good", now)).toBe(done);
    expect(reviewCard(done, "missing", "good", later)).toBe(done);
    const remembered = reviewCard(done, card.id, "good", later);
    expect(remembered.reviews[0]!.interval).toBe(1);
    expect(remembered.xp).toBe(12);
    expect(reviewCard(remembered, card.id, "good", later)).toBe(remembered);
    const forgot = reviewCard(done, card.id, "again", later);
    expect(forgot.reviews[0]!.lapses).toBe(1);
    expect(forgot.reviews[0]!.interval).toBe(0);
    expect(reviewCard(done, card.id, "hard", later).reviews[0]!.interval).toBe(
      1,
    );
  });
  it("caps spacing at 30 days and does not postpone existing due cards on replay", () => {
    const p = lesson();
    const done = completeLesson(p, p.active!.id, now);
    done.reviews[0]!.interval = 30;
    const later = new Date(now.getTime() + 86400001);
    const reviewed = reviewCard(done, done.reviews[0]!.id, "good", later);
    expect(reviewed.reviews[0]!.interval).toBe(30);
    const replay = lesson(done);
    const repeated = completeLesson(replay, replay.active!.id, later);
    expect(repeated.reviews[0]!.dueAt).toBe(done.reviews[0]!.dueAt);
  });
  it("counts calendar days without breaking the streak before today is studied", () => {
    const p = fresh();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(yesterday);
    dayBefore.setDate(dayBefore.getDate() - 1);
    p.activity = { [localDay(yesterday)]: 5, [localDay(dayBefore)]: 4 };
    expect(streak(p, now)).toBe(2);
    p.activity[localDay(now)] = 3;
    expect(streak(p, now)).toBe(3);
    expect(streak(fresh(), now)).toBe(0);
  });
});
