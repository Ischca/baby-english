import { router } from "expo-router";
import { XStack, YStack } from "tamagui";
import { missions, stageNames } from "@shared/learning/curriculum";
import { isUnlocked } from "@shared/learning/engine";
import { useLearning } from "../../src/store";
import { Action, Body, Frame, Label, Panel, Title } from "../../src/kit";

export default function Journey() {
  const { progress, start } = useLearning();
  const profile = progress.profile;
  if (!profile) return null;
  return (
    <Frame
      title="Your growing world."
      eyebrow="JOURNEY"
      subtitle="18の小さな冒険。言えることが、少しずつ増えていく。"
    >
      {progress.active && (
        <Action onPress={() => router.push("/lesson")}>
          途中のミッションを続ける
        </Action>
      )}
      {stageNames.map((name, stage) => (
        <YStack key={name} gap={16}>
          <Label>CHAPTER {String(stage + 1).padStart(2, "0")}</Label>
          <Title small>{name}</Title>
          {missions
            .filter((m) => m.stage === stage)
            .map((mission) => {
              const unlocked = isUnlocked(mission, progress);
              const mastered = progress.mastered.includes(mission.id);
              return (
                <Panel key={mission.id}>
                  <XStack
                    flexWrap="wrap"
                    gap={16}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <YStack flex={1} minWidth={200} gap={6}>
                      <Label>
                        {mastered
                          ? "DISCOVERED"
                          : stage < profile.placement
                            ? "PLACEMENT / おさらい"
                            : `${mission.minutes} MIN`}
                      </Label>
                      <Title small>{mission[profile.route].title}</Title>
                      <Body small muted>
                        {mission.skill}
                      </Body>
                    </YStack>
                    <Action
                      secondary
                      disabled={!unlocked || !!progress.active}
                      onPress={() => {
                        start(mission.id);
                        router.push("/lesson");
                      }}
                    >
                      {mastered
                        ? "もう一度"
                        : unlocked
                          ? "始める"
                          : "前の章をクリア"}
                    </Action>
                  </XStack>
                </Panel>
              );
            })}
        </YStack>
      ))}
    </Frame>
  );
}
