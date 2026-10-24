import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import { getMission } from "@shared/learning/curriculum";
import { useLearning } from "../../src/store";
import { Action, Body, Frame, Icon } from "../../src/kit";
import { EmptyWords, PartnerAvatar } from "../../src/game";
import { palette as c } from "../../src/theme";

export default function Journal() {
  const progress = useLearning((s) => s.progress);
  const [onlyPractice, setOnlyPractice] = useState(false);
  const history = progress.history.filter((h) => !onlyPractice || !h.passed);
  return (
    <Frame title="会話の思い出">
      <XStack backgroundColor={c.line} borderRadius={16} padding={4} gap={3}>
        {[false, true].map((practice, index) => (
          <Button
            key={index}
            flex={1}
            height={42}
            borderRadius={13}
            borderWidth={0}
            accessibilityRole="button"
            accessibilityState={{ selected: onlyPractice === practice }}
            backgroundColor={
              onlyPractice === practice ? c.white : "transparent"
            }
            color={onlyPractice === practice ? c.ink : c.muted}
            fontSize={13}
            fontWeight="700"
            onPress={() => setOnlyPractice(practice)}
          >
            {practice ? "もう一度練習" : "すべて"}
          </Button>
        ))}
      </XStack>
      {!history.length ? (
        <YStack alignItems="center" paddingVertical={30} gap={18}>
          <EmptyWords />
          <Body>
            {progress.history.length
              ? "この条件の記録はありません。"
              : "はじめての会話を、思い出に。"}
          </Body>
          <Body small muted>
            話したこと、言えるようになったことがここに残ります。
          </Body>
          <Action compact onPress={() => router.push("/")}>
            今日のミッションへ
          </Action>
        </YStack>
      ) : (
        <YStack backgroundColor={c.white} borderRadius={22} overflow="hidden">
          {history.map((item, index) => {
            const scene = getMission(item.missionId)?.[item.route];
            return (
              <Button
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel="会話と振り返りを見る"
                height="auto"
                padding={16}
                borderRadius={0}
                borderWidth={0}
                borderBottomWidth={index < history.length - 1 ? 1 : 0}
                borderColor={c.line}
                backgroundColor={c.white}
                onPress={() =>
                  router.push({ pathname: "/result", params: { id: item.id } })
                }
                pressStyle={{ backgroundColor: c.pale }}
              >
                <XStack gap={12} width="100%" alignItems="center">
                  <PartnerAvatar name={scene?.partner ?? "Mia"} size={50} />
                  <YStack flex={1} gap={6}>
                    <XStack
                      gap={8}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Text fontWeight="800" fontSize={14} color={c.ink}>
                        {scene?.partner ?? "会話"}
                      </Text>
                      <Text fontSize={10} color={c.muted}>
                        {new Date(item.endedAt).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </XStack>
                    <Text
                      textAlign="left"
                      fontSize={14}
                      color={c.ink}
                      numberOfLines={1}
                    >
                      {scene?.title ?? item.missionId}
                    </Text>
                    <Text
                      textAlign="left"
                      fontSize={12}
                      color={c.muted}
                      numberOfLines={1}
                    >
                      {item.turns.at(-1)?.answer ?? "会話を完了"}
                    </Text>
                    <XStack gap={5} alignItems="center">
                      <Icon
                        name={item.passed ? "checkmark-circle" : "leaf"}
                        size={13}
                        color={c.green}
                      />
                      <Text color={c.green} fontSize={10}>
                        {item.passed ? "自力でクリア" : "練習を完了"} · +
                        {item.xp} XP
                      </Text>
                    </XStack>
                  </YStack>
                  <Icon name="chevron-forward" size={16} color={c.muted} />
                </XStack>
              </Button>
            );
          })}
        </YStack>
      )}
    </Frame>
  );
}
