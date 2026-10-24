import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack, Text, Button } from "tamagui";
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
  Icon,
  IconButton,
} from "../src/kit";
import { PartnerAvatar, PopIn } from "../src/game";
import {
  FeedbackMessage,
  LearnerMessage,
  TutorMessage,
} from "../src/conversation";
import { speak, useSpeechInput } from "../src/speech";
import { palette as c } from "../src/theme";

export default function Lesson() {
  const { progress, turn, finish, hint } = useLearning();
  const active = progress.active;
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [inputType, setInputType] = useState<"text" | "voice" | "choice">(
    "text",
  );
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [error, setError] = useState("");
  const [ai, setAi] = useState(hasCoach());
  const locked = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const voice = useSpeechInput((value) => {
    setText(value);
    setInputType("voice");
  });
  const mutation = useMutation({ mutationFn: evaluateWithCoach });
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      scroll.current?.scrollToEnd({ animated: false }),
    );
    return () => cancelAnimationFrame(id);
  }, [active?.turns.length, feedbackOpen]);
  if (!active)
    return (
      <Frame title="会話をはじめよう" back>
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
      style={{ flex: 1, minHeight: 0 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <YStack flex={1} minHeight={0} backgroundColor={c.chat}>
        <YStack
          paddingHorizontal={12}
          paddingTop={9}
          paddingBottom={10}
          gap={9}
          backgroundColor={c.white}
          borderBottomWidth={1}
          borderBottomColor={c.line}
        >
          <XStack alignItems="center" gap={9}>
            <IconButton
              name="chevron-back"
              label="保存して戻る"
              disabled={busy}
              onPress={() => router.dismissTo("/")}
            />
            <PartnerAvatar name={scene.partner} size={42} />
            <YStack flex={1} gap={3}>
              <Text color={c.ink} fontSize={17} fontWeight="800">
                {scene.partner}
              </Text>
              <Text color={c.muted} fontSize={11} numberOfLines={1}>
                {scene.title}
              </Text>
            </YStack>
            <Text color={c.green} fontSize={12} fontWeight="800">
              {Math.min(stepIndex + 1, 4)} / 4
            </Text>
            <IconButton
              name="ellipsis-horizontal"
              label="会話の説明"
              onPress={() => setDetails(!details)}
            />
          </XStack>
          <XStack gap={5} paddingHorizontal={7}>
            {[0, 1, 2, 3].map((i) => (
              <YStack
                key={i}
                flex={1}
                height={5}
                borderRadius={4}
                backgroundColor={
                  i < active.turns.length
                    ? c.green
                    : i === stepIndex
                      ? "#A8CBB4"
                      : c.line
                }
              />
            ))}
          </XStack>
        </YStack>
        {details && (
          <YStack
            padding={15}
            gap={9}
            backgroundColor={c.white}
            borderBottomWidth={1}
            borderBottomColor={c.line}
          >
            <Body small>
              {ai
                ? "AI添削：自由な言い方で話せます。"
                : "例文練習：用意された表現と照合します。別の正しい言い方を判定できない場合があります。"}
            </Body>
            <Body small muted>
              音声入力は認識された英文を確認して送信します。発音の採点は行いません。
            </Body>
            {hasCoach() && (
              <Action
                secondary
                compact
                disabled={busy}
                onPress={() => {
                  setAi(!ai);
                  setError("");
                }}
              >
                {ai ? "例文練習に切り替え" : "AI添削に切り替え"}
              </Action>
            )}
          </YStack>
        )}
        <ScrollView
          ref={scroll}
          testID="conversation-thread"
          style={{ flex: 1, minHeight: 0 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: false })
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 22 }}
        >
          <YStack gap={16}>
            <YStack
              alignItems="center"
              paddingTop={3}
              paddingBottom={8}
              gap={7}
            >
              <Text fontSize={10} fontWeight="700" color={c.muted}>
                {active.route === "baby" ? "BABY LIFE" : "REAL LIFE"} ·{" "}
                {mission.skill}
              </Text>
              <Text
                maxWidth={420}
                color={c.muted}
                fontSize={11}
                lineHeight={18}
                textAlign="center"
              >
                {scene.setting}
              </Text>
            </YStack>
            {active.turns.map((item, i) => (
              <YStack key={item.step} gap={10}>
                <TutorMessage text={item.prompt} partner={scene.partner} />
                <PopIn>
                  <LearnerMessage text={item.answer} />
                </PopIn>
                <FeedbackMessage
                  turn={item}
                  compact={!showingFeedback || i !== active.turns.length - 1}
                />
              </YStack>
            ))}
            {!showingFeedback && (
              <PopIn key={`prompt-${stepIndex}`}>
                <YStack gap={12}>
                  {stepIndex === 3 && (
                    <XStack justifyContent="center" gap={5} alignItems="center">
                      <Icon name="compass-outline" size={13} color={c.muted} />
                      <Text fontSize={10} color={c.muted}>
                        こんどは、別の場面で
                      </Text>
                    </XStack>
                  )}
                  <TutorMessage
                    text={scene.prompts[stepIndex]!}
                    partner={scene.partner}
                    current
                    onError={setError}
                  />
                </YStack>
              </PopIn>
            )}
            {mutation.isPending && (
              <XStack marginLeft={40} alignItems="center" gap={7}>
                <Text color={c.green} fontSize={20}>
                  •••
                </Text>
                <Text fontSize={11} color={c.muted}>
                  返事を確認しています
                </Text>
              </XStack>
            )}
          </YStack>
        </ScrollView>
        <YStack
          testID="conversation-composer"
          backgroundColor={c.white}
          paddingHorizontal={15}
          paddingTop={11}
          paddingBottom={Math.max(13, insets.bottom)}
          gap={9}
          borderTopWidth={1}
          borderTopColor={c.line}
        >
          {(error || voice.error) && (
            <ErrorNotice text={error || voice.error} />
          )}
          {showingFeedback ? (
            <>
              <Action
                testID="next-step"
                icon={active.turns.length === 4 ? "sparkles" : "arrow-forward"}
                onPress={next}
              >
                {active.turns.length === 4 ? "今日の振り返りへ" : "次の場面へ"}
              </Action>
              <Text textAlign="center" fontSize={10} color={c.muted}>
                {active.turns.length === 4
                  ? "今日のことばを、持ち帰ろう。"
                  : "会話は上にスクロールして振り返れます"}
              </Text>
            </>
          ) : (
            <>
              <XStack
                alignItems="center"
                justifyContent="space-between"
                gap={8}
              >
                <XStack alignItems="center" gap={5} flex={1}>
                  <Icon name="chatbubble-outline" size={13} color={c.muted} />
                  <Text fontSize={11} color={c.muted}>
                    {step.cue}
                  </Text>
                </XStack>
                <Button
                  height={32}
                  minWidth={44}
                  paddingHorizontal={8}
                  backgroundColor="transparent"
                  borderWidth={0}
                  color={c.gold}
                  fontSize={11}
                  fontWeight="700"
                  accessibilityRole="button"
                  accessibilityLabel="例文ヒント"
                  disabled={busy}
                  onPress={() => hint(stepIndex)}
                  icon={<Icon name="bulb-outline" color={c.gold} size={16} />}
                >
                  ヒント
                </Button>
              </XStack>
              {helped && (
                <YStack
                  backgroundColor={c.peach}
                  padding={12}
                  borderRadius={14}
                  gap={5}
                >
                  <XStack alignItems="center" gap={6}>
                    <Text flex={1} fontSize={15} fontWeight="700" color={c.ink}>
                      {step.example}
                    </Text>
                    <IconButton
                      label="例文を聞く"
                      name="volume-medium-outline"
                      onPress={() => speak(step.example, true)}
                    />
                  </XStack>
                  <Text fontSize={10} lineHeight={16} color={c.muted}>
                    例文を見た回答では、技能のクリア判定は行いません。
                  </Text>
                </YStack>
              )}
              {stepIndex < 2 && step.choices && (
                <XStack gap={7} flexWrap="wrap">
                  {step.choices.map((choice) => (
                    <Button
                      key={choice}
                      flex={1}
                      minWidth={80}
                      minHeight={42}
                      height="auto"
                      paddingVertical={9}
                      paddingHorizontal={9}
                      borderRadius={14}
                      borderWidth={1}
                      borderBottomWidth={3}
                      borderColor={text === choice ? c.green : c.line}
                      backgroundColor={text === choice ? c.pale : c.white}
                      disabled={busy}
                      accessibilityRole="button"
                      onPress={() => {
                        setText(choice);
                        setInputType("choice");
                      }}
                    >
                      <Text
                        color={c.ink}
                        fontSize={13}
                        lineHeight={18}
                        textAlign="center"
                        fontWeight="600"
                      >
                        {choice}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              )}
              <XStack gap={7} alignItems="flex-end">
                <IconButton
                  name={voice.listening ? "stop" : "mic-outline"}
                  label={voice.listening ? "録音を止める" : "話して入力"}
                  filled={voice.listening}
                  disabled={
                    !voice.supported || voice.busy || mutation.isPending
                  }
                  onPress={() => void voice.toggle()}
                />
                <Field
                  testID="answer-input"
                  accessibilityLabel="英語での回答"
                  placeholder={
                    voice.listening ? "聞いています…" : "英語でメッセージ…"
                  }
                  value={text}
                  onChangeText={(value) => {
                    setText(value);
                    setInputType("text");
                  }}
                  maxLength={500}
                  multiline
                  minHeight={46}
                  maxHeight={96}
                  flex={1}
                  paddingVertical={11}
                  paddingHorizontal={13}
                  textAlignVertical="center"
                  backgroundColor={c.paper}
                  disabled={busy}
                  returnKeyType="send"
                  submitBehavior="submit"
                  onSubmitEditing={() => void submit()}
                />
                <IconButton
                  testID="send-answer"
                  name={mutation.isPending ? "ellipsis-horizontal" : "arrow-up"}
                  label={mutation.isPending ? "考えています…" : "返事をする"}
                  filled
                  disabled={!text.trim() || busy}
                  onPress={() => void submit()}
                />
              </XStack>
              <Text fontSize={10} textAlign="center" color={c.muted}>
                {voice.busy
                  ? "音声を文字にしています…"
                  : voice.listening
                    ? "話し終えたら停止を押してください"
                    : ai
                      ? "AI添削 · 自分のことばで話そう"
                      : "例文練習 · ひとことからで大丈夫"}
              </Text>
            </>
          )}
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
