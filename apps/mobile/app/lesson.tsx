import { useRef, useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { XStack, YStack, Text } from "tamagui";
import { useMutation } from "@tanstack/react-query";
import { getMission } from "@shared/learning/curriculum";
import { evaluatePractice } from "@shared/learning/engine";
import { evaluateWithCoach, hasCoach } from "@shared/api";
import { useLearning } from "../src/store";
import {
  Action,
  Body,
  ErrorNotice,
  Field,
  Frame,
  Label,
  Meter,
  Panel,
  Title,
} from "../src/kit";
import { speak, useSpeechInput } from "../src/speech";
import { palette as c } from "../src/theme";

export default function Lesson() {
  const { progress, turn, finish, hint } = useLearning();
  const active = progress.active;
  const [text, setText] = useState("");
  const [inputType, setInputType] = useState<"text" | "voice" | "choice">(
    "text",
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [error, setError] = useState("");
  const [ai, setAi] = useState(hasCoach());
  const locked = useRef(false);
  const voice = useSpeechInput((value) => {
    setText(value);
    setInputType("voice");
  });
  const mutation = useMutation({ mutationFn: evaluateWithCoach });
  if (!active)
    return (
      <Frame title="Ready for a little adventure?" back>
        <Body>ホームからミッションを始めましょう。</Body>
      </Frame>
    );
  const mission = getMission(active.missionId)!;
  const scene = mission[active.route];
  const showingFeedback = feedbackOpen || active.turns.length === 4;
  const stepIndex = showingFeedback
    ? active.turns.length - 1
    : active.turns.length;
  const step = mission.steps[stepIndex]!;
  const currentTurn = showingFeedback ? active.turns[stepIndex] : null;
  const helped = active.hintedSteps.includes(stepIndex);
  const busy = mutation.isPending || voice.busy || voice.listening;
  async function submit() {
    if (!active || !text.trim() || locked.current || showingFeedback || busy)
      return;
    locked.current = true;
    setError("");
    try {
      const feedback = ai
        ? await mutation.mutateAsync({
            missionId: active.missionId,
            route: active.route,
            step: stepIndex,
            answer: text.trim(),
            history: active.turns,
          })
        : evaluatePractice(active.missionId, stepIndex, text);
      turn(active.id, {
        step: stepIndex,
        prompt: scene.prompts[stepIndex]!,
        answer: text.trim(),
        helped,
        input: inputType,
        feedback,
      });
      setFeedbackOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "回答を記録できませんでした。");
    } finally {
      locked.current = false;
    }
  }
  function next() {
    if (active!.turns.length === 4) {
      const id = active!.id;
      finish(id);
      router.replace({ pathname: "/result", params: { id } });
    } else {
      setFeedbackOpen(false);
      setText("");
      setInputType("text");
      setError("");
    }
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Frame
        title={scene.title}
        eyebrow={`${active.route === "baby" ? "BABY LIFE" : "REAL LIFE"} / ${mission.skill}`}
      >
        <XStack
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={10}
        >
          <Action
            secondary
            disabled={busy}
            onPress={() => router.dismissTo("/")}
            icon="arrow-back"
          >
            保存して戻る
          </Action>
          <Label>
            {stepIndex + 1} / 4 ·{" "}
            {stepIndex >= 2 ? "YOUR OWN WORDS" : "WARM UP"}
          </Label>
        </XStack>
        <Meter value={(stepIndex + (showingFeedback ? 1 : 0)) / 4} />
        <Panel tone="green">
          <Label>{scene.partner.toUpperCase()}</Label>
          <Title small>{scene.prompts[stepIndex]}</Title>
          <XStack gap={10} flexWrap="wrap">
            <Action
              secondary
              icon="volume-high-outline"
              onPress={() =>
                speak(scene.prompts[stepIndex]!, false, () =>
                  setError(
                    "音声を再生できませんでした。端末の音声設定を確認してください。",
                  ),
                )
              }
            >
              聞く
            </Action>
            <Action
              secondary
              onPress={() => speak(scene.prompts[stepIndex]!, true)}
            >
              ゆっくり
            </Action>
          </XStack>
        </Panel>
        {currentTurn ? (
          <YStack gap={18}>
            <Panel>
              <Label>YOU SAID</Label>
              <Body>{currentTurn.answer}</Body>
            </Panel>
            <Panel tone={currentTurn.feedback.accepted ? "green" : "blue"}>
              <Label>
                {currentTurn.feedback.source === "ai"
                  ? "AI FEEDBACK"
                  : "PHRASE PRACTICE"}
              </Label>
              <Body>{currentTurn.feedback.feedback}</Body>
              <Text fontSize={22} lineHeight={32} color={c.ink}>
                {currentTurn.feedback.recast}
              </Text>
              <Action
                secondary
                onPress={() => speak(currentTurn.feedback.recast)}
              >
                この表現を聞く
              </Action>
              {currentTurn.helped && (
                <Body small muted>
                  例文を使った練習として記録しました。次は見ずに言ってみましょう。
                </Body>
              )}
            </Panel>
            <Action testID="next-step" onPress={next}>
              {active.turns.length === 4 ? "今日の振り返りへ" : "次の場面へ"}
            </Action>
          </YStack>
        ) : (
          <Panel>
            <Label>
              {stepIndex === 3 ? "TRY IT SOMEWHERE NEW" : "YOUR TURN"}
            </Label>
            <Body>{step.cue}</Body>
            {stepIndex < 2 && step.choices && (
              <YStack gap={10}>
                {step.choices.map((choice) => (
                  <Action
                    secondary={text !== choice}
                    key={choice}
                    disabled={busy}
                    onPress={() => {
                      setText(choice);
                      setInputType("choice");
                    }}
                  >
                    {choice}
                  </Action>
                ))}
              </YStack>
            )}
            <Field
              testID="answer-input"
              accessibilityLabel="英語での回答"
              placeholder="Say it in English…"
              value={text}
              onChangeText={(value) => {
                setText(value);
                setInputType("text");
              }}
              maxLength={500}
              multiline
              minHeight={90}
              textAlignVertical="top"
              disabled={busy}
            />
            <XStack gap={10} flexWrap="wrap">
              <Action
                secondary
                disabled={voice.busy || mutation.isPending}
                onPress={() => void voice.toggle()}
                icon={voice.listening ? "stop" : "mic-outline"}
              >
                {voice.listening
                  ? "録音を止める"
                  : voice.busy
                    ? "文字にしています…"
                    : "話して入力"}
              </Action>
              <Action secondary disabled={busy} onPress={() => hint(stepIndex)}>
                例文ヒント
              </Action>
            </XStack>
            {helped && (
              <YStack
                gap={8}
                backgroundColor={c.paper}
                padding={15}
                borderRadius={12}
              >
                <Body>{step.example}</Body>
                <Body small muted>
                  例文を見た回答では、技能のクリア判定は行いません。
                </Body>
                <Action secondary onPress={() => speak(step.example, true)}>
                  例文を聞く
                </Action>
              </YStack>
            )}
            <Body small muted>
              {voice.supported
                ? "音声入力後、認識された文を確認してから送信してください。発音の採点は行いません。"
                : "この環境ではキーボードの音声入力、または文字入力で続けられます。"}
            </Body>
            <Action
              testID="send-answer"
              disabled={!text.trim() || busy}
              onPress={() => void submit()}
            >
              {mutation.isPending ? "考えています…" : "返事をする"}
            </Action>
          </Panel>
        )}
        {(error || voice.error) && <ErrorNotice text={error || voice.error} />}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={12}
        >
          <Body small muted>
            {ai
              ? "AI添削 · 自由な表現で話せます"
              : "例文練習 · 用意された表現と照合します"}
          </Body>
          {hasCoach() && (
            <Action
              secondary
              disabled={busy}
              onPress={() => {
                setAi(!ai);
                setError("");
              }}
            >
              {ai ? "例文練習に切り替え" : "AI添削に切り替え"}
            </Action>
          )}
        </XStack>
      </Frame>
    </KeyboardAvoidingView>
  );
}
