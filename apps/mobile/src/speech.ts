import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { hasCoach, transcribe } from "@shared/api";

interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function useSpeechInput(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null);
  const recorder = useRef<Audio.Recording | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const callback = useRef(onText);
  callback.current = onText;
  const web =
    Platform.OS === "web" && typeof window !== "undefined"
      ? (window as SpeechWindow)
      : null;
  const Constructor = web?.SpeechRecognition ?? web?.webkitSpeechRecognition;
  const supported = Platform.OS === "web" ? !!Constructor : hasCoach();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      recognition.current?.abort();
      if (timer.current) clearTimeout(timer.current);
      void recorder.current?.stopAndUnloadAsync().catch(() => undefined);
      void Speech.stop();
    };
  }, []);
  async function stopNative() {
    const current = recorder.current;
    if (!current) return;
    recorder.current = null;
    if (timer.current) clearTimeout(timer.current);
    setListening(false);
    setBusy(true);
    try {
      await current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = current.getURI();
      if (!uri) throw new Error("音声を保存できませんでした。");
      const form = new FormData();
      form.append("file", {
        uri,
        name: "speech.m4a",
        type: "audio/mp4",
      } as unknown as Blob);
      const text = await transcribe(form);
      if (mounted.current) callback.current(text);
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "音声を読み取れませんでした。",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function toggle() {
    setError("");
    if (busy) return;
    if (listening) {
      if (Platform.OS === "web") recognition.current?.stop();
      else await stopNative();
      return;
    }
    await Speech.stop();
    if (Platform.OS === "web" && Constructor) {
      const rec = new Constructor();
      recognition.current = rec;
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (event) => {
        const text = event.results[0]?.[0]?.transcript;
        if (text && mounted.current) callback.current(text);
      };
      rec.onerror = (event) => {
        if (mounted.current) {
          setListening(false);
          setError(
            event.error === "not-allowed"
              ? "マイクの利用を許可してください。文字入力でも続けられます。"
              : "音声を聞き取れませんでした。もう一度話すか、入力してください。",
          );
        }
      };
      rec.onend = () => {
        if (timer.current) clearTimeout(timer.current);
        if (mounted.current) setListening(false);
      };
      try {
        rec.start();
        setListening(true);
        timer.current = setTimeout(() => rec.stop(), 20000);
      } catch {
        setError(
          "このブラウザでは音声入力を開始できません。文字入力を使ってください。",
        );
      }
      return;
    }
    if (!supported) {
      setError("音声入力は、この端末のキーボードのマイクからも利用できます。");
      return;
    }
    setBusy(true);
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted)
        throw new Error("マイクの利用を許可してください。");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      if (!mounted.current) {
        await recording.stopAndUnloadAsync();
        return;
      }
      recorder.current = recording;
      setListening(true);
      timer.current = setTimeout(() => {
        void stopNative();
      }, 20000);
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error ? e.message : "録音を開始できませんでした。",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return { listening, busy, error, supported, toggle };
}
export function speak(text: string, slow = false, onError?: () => void) {
  void Speech.stop()
    .then(() =>
      Speech.speak(text, {
        language: "en-US",
        rate: slow ? 0.72 : 0.92,
        onError: () => onError?.(),
      }),
    )
    .catch(() => onError?.());
}
