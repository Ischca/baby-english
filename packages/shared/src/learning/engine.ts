import { missions, getMission } from "./curriculum.ts";
import {
  ActiveLessonSchema,
  ProgressSchema,
  TurnSchema,
  type Feedback,
  type LifeRoute,
  type Mission,
  type Profile,
  type Progress,
  type ReviewCard,
  type Turn,
} from "./types.ts";

export const emptyProgress = (now = new Date()): Progress => ({
  version: 2,
  profile: null,
  active: null,
  history: [],
  reviews: [],
  mastered: [],
  xp: 0,
  xpByMission: {},
  activity: {},
  updatedAt: now.toISOString(),
});
export function localDay(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function placementStage(correct: number): number {
  return correct >= 4 ? 2 : correct >= 2 ? 1 : 0;
}
export function englishAge(progress: Progress): number {
  const demonstrated = missions.filter(
    (m) =>
      m.stage < (progress.profile?.placement ?? 0) ||
      progress.mastered.includes(m.id),
  );
  return Math.min(18, demonstrated.length);
}
export function isUnlocked(mission: Mission, progress: Progress): boolean {
  if (mission.stage <= (progress.profile?.placement ?? 0)) return true;
  return missions
    .filter(
      (m) =>
        m.stage < mission.stage &&
        m.stage >= (progress.profile?.placement ?? 0),
    )
    .every((m) => progress.mastered.includes(m.id));
}
export function recommendedMission(progress: Progress): Mission {
  const available = missions.filter(
    (m) =>
      isUnlocked(m, progress) &&
      !progress.mastered.includes(m.id) &&
      m.stage >= (progress.profile?.placement ?? 0),
  );
  // Listening repair has immediate everyday value; work focus prioritises updates
  // once the preceding chapter is independently demonstrated.
  const priority =
    progress.profile?.focus === "work"
      ? ["ask-again", "give-an-update"]
      : progress.profile?.focus === "travel"
        ? ["ask-again", "make-a-plan"]
        : [];
  return (
    available.find((m) => priority.includes(m.id)) ??
    available[0] ??
    missions[missions.length - 1]!
  );
}
export function configureProfile(
  progress: Progress,
  profile: Profile,
  now = new Date(),
): Progress {
  return ProgressSchema.parse({
    ...progress,
    profile,
    updatedAt: now.toISOString(),
  });
}
export function startLesson(
  progress: Progress,
  missionId: string,
  id: string,
  now = new Date(),
): Progress {
  const mission = getMission(missionId);
  if (!progress.profile || !mission || !isUnlocked(mission, progress))
    throw new Error("このミッションはまだ始められません。");
  if (progress.active)
    throw new Error("途中のミッションを続けるか、終了してください。");
  return {
    ...progress,
    active: ActiveLessonSchema.parse({
      id,
      missionId,
      route: progress.profile.route,
      startedAt: now.toISOString(),
      turns: [],
    }),
    updatedAt: now.toISOString(),
  };
}
export function normalizeAnswer(answer: string): string {
  return answer
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bit's\b/g, "it is")
    .replace(/\bi'll\b/g, "i will")
    .replace(/\bi've\b/g, "i have")
    .replace(/\bi'd\b/g, "i would")
    .replace(/\bthat's\b/g, "that is")
    .replace(/\bcan't\b/g, "cannot")
    .replace(/\bisn't\b/g, "is not")
    .replace(/\blet's\b/g, "let us")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function evaluatePractice(
  missionId: string,
  stepIndex: number,
  answer: string,
): Feedback {
  const step = getMission(missionId)?.steps[stepIndex];
  if (!step) throw new Error("練習が見つかりません。");
  const accepted = [step.example, ...step.alternatives].some(
    (example) => normalizeAnswer(example) === normalizeAnswer(answer),
  );
  return {
    accepted,
    feedback: accepted
      ? "You got it! その表現を使えました。"
      : "この練習の表現を確認しましょう。別の正しい言い方でも、例文練習では判定できない場合があります。",
    recast: accepted ? answer.trim() : step.example,
    source: "practice",
  };
}
export function addTurn(
  progress: Progress,
  lessonId: string,
  turn: Turn,
  now = new Date(),
): Progress {
  const active = progress.active;
  if (!active || active.id !== lessonId)
    throw new Error("ミッションが変わりました。もう一度お試しください。");
  const parsed = TurnSchema.parse(turn);
  if (active.turns.length !== parsed.step)
    throw new Error("この回答はすでに記録されています。");
  parsed.helped = parsed.helped || active.hintedSteps.includes(parsed.step);
  return {
    ...progress,
    active: { ...active, turns: [...active.turns, parsed] },
    updatedAt: now.toISOString(),
  };
}
export function completeLesson(
  progress: Progress,
  lessonId: string,
  now = new Date(),
): Progress {
  if (progress.history.some((h) => h.id === lessonId)) return progress;
  const active = progress.active;
  if (!active || active.id !== lessonId || active.turns.length !== 4)
    throw new Error("4つの会話を終えてから振り返りましょう。");
  const mission = getMission(active.missionId)!;
  const successes = active.turns.filter((t) => t.feedback.accepted).length;
  const independent = active.turns
    .slice(2)
    .every((t) => t.feedback.accepted && !t.helped && t.input !== "choice");
  const passed = successes >= 3 && independent;
  const priorXp = Math.max(
    progress.xpByMission[mission.id] ?? 0,
    progress.mastered.includes(mission.id) ? 60 : 0,
    progress.history
      .filter((h) => h.missionId === mission.id)
      .reduce((sum, h) => sum + h.xp, 0),
  );
  const xp = Math.max(0, (passed ? 60 : 10) - priorXp);
  const newCards: ReviewCard[] = active.turns.slice(2).map((turn) => {
    const id = `${mission.id}-${turn.step}`;
    const previous = progress.reviews.find((card) => card.id === id);
    const needsReview = !turn.feedback.accepted || turn.helped;
    return {
      id,
      missionId: mission.id,
      cue: mission.steps[turn.step]!.cue,
      phrase: turn.feedback.recast || mission.steps[turn.step]!.example,
      dueAt: needsReview
        ? new Date(now.getTime() + 10 * 60000).toISOString()
        : (previous?.dueAt ?? new Date(now.getTime() + 86400000).toISOString()),
      interval: needsReview ? 0 : (previous?.interval ?? 1),
      repetitions: previous?.repetitions ?? 0,
      lapses: previous?.lapses ?? 0,
    };
  });
  const day = localDay(now);
  // Count engaged lesson time, with a per-session cap; leaving a tab overnight
  // must not satisfy a daily goal. Turns are the reliable activity proxy.
  const minutes = Math.min(
    mission.minutes,
    Math.max(
      1,
      Math.round((now.getTime() - Date.parse(active.startedAt)) / 60000),
    ),
  );
  return {
    ...progress,
    active: null,
    history: [
      {
        ...active,
        endedAt: now.toISOString(),
        passed,
        score: successes * 25,
        xp,
      },
      ...progress.history,
    ].slice(0, 1000),
    reviews: [
      ...progress.reviews.filter(
        (card) => !newCards.some((n) => n.id === card.id),
      ),
      ...newCards,
    ],
    mastered: passed
      ? [...new Set([...progress.mastered, mission.id])]
      : progress.mastered,
    xp: progress.xp + xp,
    xpByMission: {
      ...progress.xpByMission,
      [mission.id]: Math.min(60, priorXp + xp),
    },
    activity: {
      ...progress.activity,
      [day]: (progress.activity[day] ?? 0) + minutes,
    },
    updatedAt: now.toISOString(),
  };
}
export function dueReviews(progress: Progress, now = new Date()): ReviewCard[] {
  return progress.reviews
    .filter((card) => Date.parse(card.dueAt) <= now.getTime())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
export function reviewCard(
  progress: Progress,
  id: string,
  rating: "again" | "hard" | "good",
  now = new Date(),
): Progress {
  const card = progress.reviews.find((c) => c.id === id);
  if (!card || Date.parse(card.dueAt) > now.getTime()) return progress;
  const interval =
    rating === "again"
      ? 0
      : rating === "hard"
        ? 1
        : Math.min(30, Math.max(1, card.interval * 2));
  const dueAt = new Date(
    now.getTime() + (interval ? interval * 86400000 : 10 * 60000),
  ).toISOString();
  const day = localDay(now);
  return {
    ...progress,
    reviews: progress.reviews.map((c) =>
      c.id === id
        ? {
            ...c,
            interval,
            dueAt,
            repetitions: c.repetitions + 1,
            lapses: c.lapses + (rating === "again" ? 1 : 0),
          }
        : c,
    ),
    xp: progress.xp + (rating === "good" ? 2 : 0),
    activity: {
      ...progress.activity,
      [day]: (progress.activity[day] ?? 0) + 1,
    },
    updatedAt: now.toISOString(),
  };
}
export function streak(progress: Progress, now = new Date()): number {
  const date = new Date(now);
  let count = 0;
  if (!progress.activity[localDay(date)]) date.setDate(date.getDate() - 1);
  while (progress.activity[localDay(date)]) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}
export function sceneFor(mission: Mission, route: LifeRoute) {
  return mission[route];
}
