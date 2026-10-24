import { getMission } from "./curriculum.ts";
import { ProgressSchema, type Progress } from "./types.ts";

export const STORAGE_KEY = "baby-english.v2";
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export function parseProgress(value: string): Progress {
  if (value.length > 5000000) throw new Error("データが大きすぎます。");
  const progress = ProgressSchema.parse(JSON.parse(value));
  if (
    progress.active &&
    (!getMission(progress.active.missionId) ||
      progress.active.turns.some((turn, index) => turn.step !== index))
  )
    throw new Error("途中のミッションの形式が正しくありません。");
  if (progress.mastered.some((id) => !getMission(id)))
    throw new Error("学習データのバージョンを確認してください。");
  return progress;
}
export function createProgressStorage(storage: Storage) {
  let pending = Promise.resolve();
  return {
    async load(): Promise<Progress | null> {
      const raw = await storage.getItem(STORAGE_KEY);
      return raw ? parseProgress(raw) : null;
    },
    save(progress: Progress): Promise<void> {
      const value = JSON.stringify(ProgressSchema.parse(progress));
      // Preserve ordering when AsyncStorage is slower than the user's actions.
      const write = pending
        .catch(() => undefined)
        .then(() => storage.setItem(STORAGE_KEY, value));
      pending = write;
      return write;
    },
  };
}
export function exportAnki(progress: Progress): string {
  const safe = (s: string) =>
    s
      .replace(/[\t\r\n]/g, " ")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return (
    "#separator:Tab\n#html:false\n" +
    progress.reviews
      .map(
        (card) =>
          `${safe(card.cue)}\t${safe(card.phrase)}\tBabyEnglish::${card.missionId}`,
      )
      .join("\n")
  );
}
