import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { v4 as uuid } from "uuid";
import {
  addTurn,
  completeLesson,
  configureProfile,
  emptyProgress,
  reviewCard,
  startLesson,
} from "@shared/learning/engine";
import { createProgressStorage, parseProgress } from "@shared/learning/storage";
import type { Profile, Progress, Turn } from "@shared/learning/types";

const persistence = createProgressStorage(AsyncStorage);
interface State {
  progress: Progress;
  ready: boolean;
  storageError: string | null;
  loadError: boolean;
  hydrate: () => Promise<void>;
  commit: (progress: Progress) => void;
  profile: (profile: Profile) => void;
  start: (mission: string) => void;
  turn: (lessonId: string, turn: Turn) => void;
  finish: (lessonId: string) => void;
  abandon: () => void;
  hint: (step: number) => void;
  review: (id: string, rating: "again" | "hard" | "good") => void;
  importBackup: (value: string) => void;
  retrySave: () => void;
}
export const useLearning = create<State>((set, get) => ({
  progress: emptyProgress(),
  ready: false,
  storageError: null,
  loadError: false,
  hydrate: async () => {
    try {
      const saved = await persistence.load();
      set({
        progress: saved ?? emptyProgress(),
        ready: true,
        storageError: null,
        loadError: false,
      });
    } catch {
      set({
        ready: true,
        loadError: true,
        storageError:
          "保存データを読み込めませんでした。元のデータは上書きしていません。再読み込みするか、バックアップを復元してください。",
      });
    }
  },
  commit: (progress) => {
    if (get().loadError)
      throw new Error("保存データを読み込んでから再開してください。");
    set({ progress });
    void persistence
      .save(progress)
      .then(() => set({ storageError: null }))
      .catch(() =>
        set({
          storageError:
            "端末に保存できませんでした。画面を閉じる前に再保存するか、設定からバックアップを保存してください。",
        }),
      );
  },
  profile: (profile) => get().commit(configureProfile(get().progress, profile)),
  start: (mission) =>
    get().commit(startLesson(get().progress, mission, uuid())),
  turn: (lessonId, turn) =>
    get().commit(addTurn(get().progress, lessonId, turn)),
  finish: (lessonId) => get().commit(completeLesson(get().progress, lessonId)),
  abandon: () =>
    get().commit({
      ...get().progress,
      active: null,
      updatedAt: new Date().toISOString(),
    }),
  hint: (step) => {
    const p = get().progress;
    if (p.active)
      get().commit({
        ...p,
        active: {
          ...p.active,
          hintedSteps: [...new Set([...p.active.hintedSteps, step])],
        },
        updatedAt: new Date().toISOString(),
      });
  },
  review: (id, rating) => get().commit(reviewCard(get().progress, id, rating)),
  importBackup: (value) => {
    const progress = parseProgress(value);
    set({ loadError: false });
    get().commit(progress);
  },
  retrySave: () => get().commit(get().progress),
}));
