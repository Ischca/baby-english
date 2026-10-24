import { router } from "expo-router";
import { Button, Text, XStack, YStack } from "tamagui";
import { missions, stageNames } from "@shared/learning/curriculum";
import { isUnlocked, recommendedMission } from "@shared/learning/engine";
import { useLearning } from "../../src/store";
import { Action, Body, Frame, Icon, Label, type IconName } from "../../src/kit";
import { palette as c } from "../../src/theme";

const chapterIcons: IconName[] = [
  "sunny",
  "flower",
  "leaf",
  "compass",
  "chatbubbles",
  "planet",
];
const chapterColors = [c.pale, c.peach, c.blue, c.lilac, "#F5E5DD", "#DDEEE6"];
export default function Journey() {
  const { progress, start } = useLearning();
  const profile = progress.profile;
  if (!profile) return null;
  const next = recommendedMission(progress);
  return (
    <Frame title="ぼうけんマップ">
      <XStack alignItems="center" justifyContent="space-between">
        <Body small muted>
          言えることが、世界をひろげる。
        </Body>
        <Label>{progress.mastered.length} / 18 クリア</Label>
      </XStack>
      {progress.active && (
        <Action
          compact
          icon="chatbubble-ellipses"
          onPress={() => router.push("/lesson")}
        >
          途中の会話をつづける
        </Action>
      )}
      {stageNames.map((name, stage) => (
        <YStack key={name} gap={20} paddingBottom={12}>
          <XStack
            backgroundColor={chapterColors[stage]}
            padding={18}
            borderRadius={22}
            gap={14}
            alignItems="center"
          >
            <YStack
              width={44}
              height={44}
              borderRadius={15}
              backgroundColor="white"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name={chapterIcons[stage]!} color={c.green} size={26} />
            </YStack>
            <YStack gap={4}>
              <Label>CHAPTER {String(stage + 1).padStart(2, "0")}</Label>
              <Text fontSize={18} fontWeight="800" color={c.ink}>
                {name}
              </Text>
            </YStack>
          </XStack>
          <YStack width="100%" maxWidth={430} alignSelf="center" gap={0}>
            {missions
              .filter((m) => m.stage === stage)
              .map((mission, index) => {
                const unlocked = isUnlocked(mission, progress);
                const mastered = progress.mastered.includes(mission.id);
                const current = mission.id === next.id && !mastered;
                return (
                  <YStack key={mission.id} paddingLeft={index === 1 ? 44 : 10}>
                    <XStack gap={16} alignItems="center" minHeight={92}>
                      <YStack alignItems="center" width={72}>
                        <Button
                          accessibilityRole="button"
                          accessibilityLabel={
                            unlocked
                              ? `${mission[profile.route].title}を${mastered ? "もう一度" : "始める"}`
                              : "前の章をクリア"
                          }
                          disabled={!unlocked || !!progress.active}
                          onPress={() => {
                            start(mission.id);
                            router.push("/lesson");
                          }}
                          width={66}
                          height={66}
                          padding={0}
                          borderRadius={25}
                          borderWidth={current ? 3 : 1}
                          borderBottomWidth={6}
                          borderColor={mastered || current ? c.deep : c.line}
                          backgroundColor={
                            mastered || current
                              ? c.green
                              : unlocked
                                ? c.white
                                : "#E9EEE5"
                          }
                          pressStyle={{ y: 3, borderBottomWidth: 3 }}
                        >
                          <Icon
                            name={
                              mastered
                                ? "checkmark"
                                : unlocked
                                  ? chapterIcons[stage]!
                                  : "lock-closed"
                            }
                            size={27}
                            color={
                              mastered || current
                                ? c.white
                                : unlocked
                                  ? c.green
                                  : "#A4B1A3"
                            }
                          />
                        </Button>
                      </YStack>
                      <YStack flex={1} gap={5} opacity={unlocked ? 1 : 0.56}>
                        <Text
                          color={current ? c.green : c.muted}
                          fontSize={10}
                          fontWeight="800"
                        >
                          {mastered
                            ? "クリア！"
                            : current
                              ? "NEXT ADVENTURE"
                              : stage < profile.placement
                                ? "おさらい"
                                : unlocked
                                  ? `${mission.minutes}分の会話`
                                  : "まだ見ぬ世界"}
                        </Text>
                        <Text
                          fontSize={16}
                          lineHeight={23}
                          fontWeight="700"
                          color={c.ink}
                        >
                          {mission[profile.route].title}
                        </Text>
                        <Body small muted>
                          {mission.skill}
                        </Body>
                      </YStack>
                    </XStack>
                    {index < 2 && (
                      <YStack
                        marginLeft={42}
                        height={26}
                        borderLeftWidth={4}
                        borderStyle="dotted"
                        borderColor={c.line}
                      />
                    )}
                  </YStack>
                );
              })}
          </YStack>
        </YStack>
      ))}
    </Frame>
  );
}
