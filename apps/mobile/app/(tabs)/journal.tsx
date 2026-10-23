import { router } from "expo-router";
import { useState } from "react";
import { XStack } from "tamagui";
import { getMission } from "@shared/learning/curriculum";
import { useLearning } from "../../src/store";
import { Action, Body, Frame, Label, Panel, Title } from "../../src/kit";

export default function Journal() {
  const progress = useLearning((s) => s.progress);
  const [onlyPractice, setOnlyPractice] = useState(false);
  const history = progress.history.filter((h) => !onlyPractice || !h.passed);
  return (
    <Frame
      title="The story so far."
      eyebrow="JOURNAL"
      subtitle="できたことも、つまずいたことも。あなたの英語の記録。"
    >
      <XStack gap={12}>
        <Action
          secondary={!onlyPractice}
          onPress={() => setOnlyPractice(false)}
        >
          すべて
        </Action>
        <Action secondary={onlyPractice} onPress={() => setOnlyPractice(true)}>
          もう一度練習
        </Action>
      </XStack>
      {!history.length && (
        <Panel>
          <Body>
            {progress.history.length
              ? "この条件の記録はありません。"
              : "最初のミッションを終えると、会話と振り返りがここに残ります。"}
          </Body>
          <Action onPress={() => router.push("/")}>今日のミッションへ</Action>
        </Panel>
      )}
      {history.map((item) => (
        <Panel key={item.id}>
          <Label>
            {new Date(item.endedAt).toLocaleString("ja-JP")} /{" "}
            {item.route === "baby" ? "BABY LIFE" : "REAL LIFE"}
          </Label>
          <Title small>
            {getMission(item.missionId)?.[item.route].title ?? item.missionId}
          </Title>
          <Body small muted>
            {item.passed ? "自力でクリア" : "練習を完了"} · {item.score}% · +
            {item.xp} XP
          </Body>
          <Action
            secondary
            onPress={() =>
              router.push({ pathname: "/result", params: { id: item.id } })
            }
          >
            会話と振り返りを見る
          </Action>
        </Panel>
      ))}
    </Frame>
  );
}
