import { router, useLocalSearchParams } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { getMission } from "@shared/learning/curriculum";
import { englishAge } from "@shared/learning/engine";
import { useLearning } from "../src/store";
import { Action, Body, Frame, Label } from "../src/kit";
import { World } from "../src/World";
import { PopIn, RewardStars, StatPill } from "../src/game";
import {
  TutorMessage,
  LearnerMessage,
  FeedbackMessage,
} from "../src/conversation";
import { palette as c } from "../src/theme";

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { progress, start } = useLearning();
  const result = progress.history.find((h) => h.id === id);
  const mission = result && getMission(result.missionId);
  if (!result || !mission)
    return (
      <Frame title="会話の思い出" back>
        <Body>この記録は見つかりませんでした。</Body>
      </Frame>
    );
  return (
    <Frame title="今日の一歩" back>
      <PopIn>
        <YStack alignItems="center" gap={18} paddingTop={10} paddingBottom={6}>
          <RewardStars complete={result.passed} />
          <World age={englishAge(progress)} portrait size={92} />
          <Text
            fontSize={23}
            lineHeight={32}
            fontWeight="800"
            color={c.ink}
            textAlign="center"
          >
            {result.passed
              ? `${mission.skill}、できました。`
              : "表現に出会えたことも、一歩。"}
          </Text>
          <Body small muted>
            {result.passed
              ? "例文を見ずに、別の場面でも表現できました。"
              : "最後の2つをヒントなしで使えるとクリアです。"}
          </Body>
          <XStack gap={9}>
            <StatPill icon="sparkles" value={`+${result.xp} XP`} warm />
            <StatPill icon="leaf" value={`AGE ${englishAge(progress)}`} />
            <StatPill icon="checkmark-circle" value={`${result.score}%`} />
          </XStack>
        </YStack>
      </PopIn>
      <YStack backgroundColor={c.pale} padding={18} borderRadius={22} gap={12}>
        <Label>ポケットに入れたことば</Label>
        {result.turns.slice(2).map((turn) => (
          <Text
            key={turn.step}
            fontSize={17}
            lineHeight={25}
            fontWeight="700"
            color={c.green}
          >
            {turn.feedback.recast || mission.steps[turn.step]!.example}
          </Text>
        ))}
        <Body small muted>
          使った表現は復習に追加しました。うまく言えなかった表現は10分後、それ以外は翌日にもう一度。
        </Body>
      </YStack>
      <Action
        testID="back-home"
        icon="home-outline"
        onPress={() => router.dismissTo("/")}
      >
        ホームへ
      </Action>
      {!progress.active && (
        <Action
          secondary
          compact
          onPress={() => {
            start(mission.id);
            router.replace("/lesson");
          }}
        >
          同じ場面にもう一度
        </Action>
      )}
      <YStack gap={18} paddingTop={8}>
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={16} fontWeight="800" color={c.ink}>
            会話をふりかえる
          </Text>
          <Label>{result.turns.length} TURNS</Label>
        </XStack>
        {result.turns.map((turn) => (
          <YStack key={turn.step} gap={13}>
            <TutorMessage
              text={turn.prompt}
              partner={mission[result.route].partner}
            />
            <LearnerMessage text={turn.answer} />
            <FeedbackMessage turn={turn} compact />
          </YStack>
        ))}
      </YStack>
    </Frame>
  );
}
