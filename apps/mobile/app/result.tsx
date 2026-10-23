import { router, useLocalSearchParams } from "expo-router";
import { XStack, YStack } from "tamagui";
import { getMission } from "@shared/learning/curriculum";
import { englishAge } from "@shared/learning/engine";
import { useLearning } from "../src/store";
import { Action, Body, Frame, Label, Panel, Title } from "../src/kit";
import { World } from "../src/World";
import { speak } from "../src/speech";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { progress, start } = useLearning();
  const result = progress.history.find((h) => h.id === id);
  const mission = result && getMission(result.missionId);
  if (!result || !mission)
    return (
      <Frame title="Your story is still beginning." back>
        <Body>この記録は見つかりませんでした。</Body>
      </Frame>
    );
  return (
    <Frame
      title={
        result.passed
          ? "Look how far you have come."
          : "One little step forward."
      }
      eyebrow="YOUR REFLECTION"
      back
    >
      <World age={englishAge(progress)} />
      <Panel tone="green">
        <Title small>
          {result.passed
            ? `${mission.skill}、できました。`
            : "表現に出会えたことも、一歩。"}
        </Title>
        <Body>
          {result.passed
            ? "例文を見ずに、別の場面でも表現できました。"
            : "例文を確認したら、もう一度。最後の2つをヒントなしで使えるとクリアです。"}
        </Body>
        <XStack gap={22}>
          <Label>{result.score}% MATCH</Label>
          <Label>+{result.xp} XP</Label>
          <Label>AGE {englishAge(progress)}</Label>
        </XStack>
      </Panel>
      <YStack gap={14}>
        <Title small>Take these words with you.</Title>
        {result.turns.slice(2).map((turn) => (
          <Panel key={turn.step}>
            <Label>{mission.steps[turn.step]!.cue}</Label>
            <Title small>
              {turn.feedback.recast || mission.steps[turn.step]!.example}
            </Title>
            <Body small muted>
              {turn.feedback.source === "ai" ? "AI添削" : "例文練習"} ·{" "}
              {turn.helped ? "ヒントを利用" : "自力で回答"}
            </Body>
            <Action
              secondary
              onPress={() =>
                speak(turn.feedback.recast || mission.steps[turn.step]!.example)
              }
            >
              声に出してまねる
            </Action>
          </Panel>
        ))}
      </YStack>
      <Body muted>
        使った表現は復習に追加しました。うまく言えなかった表現は10分後、それ以外は翌日に、もう一度思い出します。
      </Body>
      <Action testID="back-home" onPress={() => router.dismissTo("/")}>
        ホームへ
      </Action>
      {!progress.active && (
        <Action
          secondary
          onPress={() => {
            start(mission.id);
            router.replace("/lesson");
          }}
        >
          同じ場面にもう一度
        </Action>
      )}
      <YStack gap={12}>
        <Title small>Conversation journal</Title>
        {result.turns.map((turn) => (
          <Panel key={turn.step}>
            <Label>{mission[result.route].partner.toUpperCase()}</Label>
            <Body>{turn.prompt}</Body>
            <Label>YOU</Label>
            <Body>{turn.answer}</Body>
            <Body small muted>
              {turn.feedback.feedback}
            </Body>
          </Panel>
        ))}
      </YStack>
    </Frame>
  );
}
