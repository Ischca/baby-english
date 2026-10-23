import { router } from "expo-router";
import { XStack, YStack, Text } from "tamagui";
import {
  dueReviews,
  englishAge,
  localDay,
  recommendedMission,
  streak,
} from "@shared/learning/engine";
import { useLearning } from "../../src/store";
import { Action, Body, Frame, Label, Meter, Panel, Title } from "../../src/kit";
import { World } from "../../src/World";
import { palette as c } from "../../src/theme";

export default function Today() {
  const { progress, start } = useLearning();
  const profile = progress.profile;
  if (!profile) return null;
  const mission = recommendedMission(progress);
  const scene = mission[profile.route];
  const minutes = progress.activity[localDay(new Date())] ?? 0;
  const due = dueReviews(progress).length;
  const age = englishAge(progress);
  return (
    <Frame
      title={`Hello, ${profile.name}.`}
      eyebrow="BABY ENGLISH / TODAY"
      subtitle="小さな一言が、今日の新しい世界になる。"
    >
      <XStack flexWrap="wrap" gap={24} alignItems="stretch">
        <YStack
          flex={1}
          minWidth={260}
          padding={24}
          borderRadius={28}
          backgroundColor={c.pale}
          justifyContent="space-between"
        >
          <XStack justifyContent="space-between">
            <Label>YOUR ENGLISH SELF</Label>
            <Text color={c.green} fontSize={12}>
              {profile.route === "baby" ? "Baby Life" : "Real Life"}
            </Text>
          </XStack>
          <World age={age} />
          <XStack alignItems="baseline" justifyContent="space-between">
            <Title small>English age {age}</Title>
            <Body small muted>
              {streak(progress)} day streak
            </Body>
          </XStack>
          <Meter value={age / 18} />
        </YStack>
        <YStack flex={1} minWidth={260} gap={18} justifyContent="center">
          <Label>YOUR NEXT LITTLE ADVENTURE</Label>
          <Title>{scene.title}</Title>
          <Body muted>{scene.setting}</Body>
          <XStack gap={20}>
            <Body small>{mission.minutes} min</Body>
            <Body small>{mission.skill}</Body>
          </XStack>
          <Action
            testID="start-lesson"
            icon="arrow-forward"
            onPress={() => {
              if (!progress.active) start(mission.id);
              router.push("/lesson");
            }}
          >
            {progress.active
              ? "途中のミッションを続ける"
              : "今日のミッションを始める"}
          </Action>
          <Body small muted>
            聞く → まねる → 自分で使う → 別の場面へ
          </Body>
        </YStack>
      </XStack>
      <XStack flexWrap="wrap" gap={18}>
        <YStack flex={1} minWidth={250}>
          <Panel>
            <Label>TODAY'S RHYTHM</Label>
            <XStack justifyContent="space-between">
              <Title small>
                {minutes} / {profile.dailyMinutes} min
              </Title>
              <Body small>{progress.xp} XP</Body>
            </XStack>
            <Meter value={minutes / profile.dailyMinutes} />
            <Body small muted>
              {minutes >= profile.dailyMinutes
                ? "今日の目標を達成。よく続けました。"
                : "ひとつ話して、昨日の表現を思い出す。"}
            </Body>
          </Panel>
        </YStack>
        <YStack flex={1} minWidth={250}>
          <Panel tone="blue">
            <Label>KEEP YOUR WORDS</Label>
            <Title small>
              {due
                ? `${due}つの表現を、もう一度。`
                : "覚えた言葉を、自分のものに。"}
            </Title>
            <Body small muted>
              {due
                ? "答えを見る前に、英語で言ってみましょう。"
                : "ミッションで使った表現が、ここで復習になります。"}
            </Body>
            <Action secondary onPress={() => router.push("/review")}>
              復習を開く
            </Action>
          </Panel>
        </YStack>
      </XStack>
      <Panel>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap={6}>
            <Label>YOUR JOURNEY</Label>
            <Body>{progress.mastered.length} / 18 skills discovered</Body>
          </YStack>
          <Action secondary onPress={() => router.push("/journey")}>
            世界を見渡す
          </Action>
        </XStack>
        <Body small muted>
          年齢は学習の進行目安です。例文を見ずに、別の場面でも表現できると成長します。
        </Body>
      </Panel>
    </Frame>
  );
}
