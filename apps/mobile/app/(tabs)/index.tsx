import { router } from "expo-router";
import { ScrollView, useWindowDimensions } from "react-native";
import { Button, XStack, YStack, Text } from "tamagui";
import {
  dueReviews,
  englishAge,
  localDay,
  recommendedMission,
  streak,
} from "@shared/learning/engine";
import { getMission } from "@shared/learning/curriculum";
import { useLearning } from "../../src/store";
import { Action, Body, Icon, Meter } from "../../src/kit";
import { PartnerAvatar, SceneArt, StatPill } from "../../src/game";
import { World } from "../../src/World";
import { palette as c } from "../../src/theme";

export default function Today() {
  const { progress, start } = useLearning();
  const { width } = useWindowDimensions();
  const profile = progress.profile;
  if (!profile) return null;
  const mission =
    (progress.active && getMission(progress.active.missionId)) ||
    recommendedMission(progress);
  const scene = mission[progress.active?.route ?? profile.route];
  const minutes = progress.activity[localDay(new Date())] ?? 0;
  const due = dueReviews(progress).length;
  const age = englishAge(progress);
  const begin = () => {
    if (!progress.active) start(mission.id);
    router.push("/lesson");
  };
  return (
    <YStack flex={1} minHeight={0} backgroundColor={c.paper}>
      <XStack
        paddingHorizontal={18}
        paddingVertical={13}
        alignItems="center"
        gap={10}
      >
        <YStack
          width={46}
          height={46}
          borderRadius={23}
          backgroundColor={c.pale}
          overflow="hidden"
          borderWidth={2}
          borderColor={c.white}
        >
          <World age={age} portrait size={43} />
        </YStack>
        <YStack flex={1} gap={3}>
          <Text color={c.ink} fontSize={15} fontWeight="800" numberOfLines={1}>
            Hello, {profile.name}.
          </Text>
          <Text color={c.muted} fontSize={11}>
            English age {age}
          </Text>
        </YStack>
        <StatPill icon="flame" value={streak(progress)} warm />
        <StatPill icon="sparkles" value={`${progress.xp} XP`} />
      </XStack>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 22 }}
      >
        <YStack borderRadius={26} overflow="hidden" backgroundColor={c.pale}>
          <SceneArt height={width < 480 ? 290 : 350} />
          <XStack
            position="absolute"
            top={15}
            left={15}
            right={15}
            justifyContent="space-between"
            alignItems="center"
          >
            <XStack
              backgroundColor="rgba(255,255,255,0.94)"
              paddingHorizontal={12}
              paddingVertical={8}
              borderRadius={15}
              alignItems="center"
              gap={6}
            >
              <Icon name="leaf" color={c.green} size={16} />
              <Text fontSize={12} fontWeight="800" color={c.ink}>
                {profile.route === "baby" ? "はじまりのおうち" : "新しい街へ"}
              </Text>
            </XStack>
            <YStack
              backgroundColor="rgba(255,255,255,0.92)"
              paddingHorizontal={10}
              paddingVertical={8}
              borderRadius={14}
            >
              <Text fontSize={10} fontWeight="700" color={c.green}>
                {profile.route === "baby" ? "Baby Life" : "Real Life"}
              </Text>
            </YStack>
          </XStack>
          <XStack
            position="absolute"
            bottom={31}
            left={16}
            right={16}
            alignItems="center"
            gap={9}
          >
            <PartnerAvatar name={scene.partner} size={46} />
            <YStack
              flex={1}
              backgroundColor="rgba(255,255,255,0.96)"
              borderRadius={18}
              borderBottomLeftRadius={5}
              paddingHorizontal={14}
              paddingVertical={10}
            >
              <Text fontSize={13} fontWeight="600" color={c.ink}>
                今日も、ちょっとおしゃべりしよう！
              </Text>
            </YStack>
          </XStack>
        </YStack>
        <YStack
          marginTop={-17}
          marginHorizontal={9}
          padding={18}
          gap={13}
          backgroundColor={c.white}
          borderWidth={1}
          borderBottomWidth={4}
          borderColor={c.line}
          borderRadius={24}
        >
          <XStack justifyContent="space-between" gap={8} alignItems="center">
            <YStack flex={1} gap={4}>
              <Text fontSize={10} color={c.green} fontWeight="800">
                {progress.active ? "会話のつづき" : "今日の小さな冒険"}
              </Text>
              <Text
                fontSize={22}
                lineHeight={29}
                fontWeight="800"
                color={c.ink}
              >
                {scene.title}
              </Text>
              <Text fontSize={12} color={c.muted}>
                {mission.skill} · {mission.minutes}分
              </Text>
            </YStack>
            <YStack
              width={42}
              height={42}
              borderRadius={15}
              backgroundColor={c.peach}
              justifyContent="center"
              alignItems="center"
            >
              <Icon name="chatbubble-ellipses" color={c.gold} size={22} />
            </YStack>
          </XStack>
          <Action
            testID="start-lesson"
            icon="chatbubble-ellipses-outline"
            onPress={begin}
          >
            {progress.active ? "会話をつづける" : `${scene.partner}と話す`}
          </Action>
        </YStack>
        <XStack marginTop={16} gap={12}>
          <YStack
            flex={1}
            padding={15}
            gap={10}
            backgroundColor={c.pale}
            borderRadius={21}
          >
            <XStack alignItems="center" gap={6}>
              <Icon name="sunny" size={17} color={c.green} />
              <Text fontSize={12} fontWeight="700" color={c.ink}>
                今日のペース
              </Text>
            </XStack>
            <Text fontSize={21} fontWeight="800" color={c.ink}>
              {minutes}
              <Text fontSize={12} color={c.muted}>
                {" "}
                / {profile.dailyMinutes} 分
              </Text>
            </Text>
            <Meter value={minutes / profile.dailyMinutes} />
          </YStack>
          <Button
            flex={1}
            height="auto"
            padding={15}
            borderWidth={0}
            borderRadius={21}
            backgroundColor={c.blue}
            onPress={() => router.push("/review")}
            accessibilityRole="button"
            accessibilityLabel="復習を開く"
            pressStyle={{ scale: 0.97 }}
          >
            <YStack flex={1} gap={8}>
              <XStack alignItems="center" gap={6}>
                <Icon name="albums" size={17} color="#527F99" />
                <Text fontSize={12} fontWeight="700" color={c.ink}>
                  ことばの復習
                </Text>
              </XStack>
              <Text fontSize={21} fontWeight="800" color={c.ink}>
                {due}
                <Text fontSize={12} color={c.muted}>
                  {" "}
                  個のことば
                </Text>
              </Text>
              <Text fontSize={11} color={c.muted}>
                {due ? "思い出しにいこう  →" : "次の復習までひとやすみ"}
              </Text>
            </YStack>
          </Button>
        </XStack>
        <XStack
          marginTop={16}
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={3}
        >
          <Body small muted>
            育てた技能 {progress.mastered.length} / 18
          </Body>
          <Button
            accessibilityRole="button"
            height={36}
            paddingHorizontal={10}
            borderWidth={0}
            backgroundColor="transparent"
            color={c.green}
            fontSize={12}
            fontWeight="700"
            onPress={() => router.push("/journey")}
          >
            ぼうけんマップへ →
          </Button>
        </XStack>
      </ScrollView>
    </YStack>
  );
}
