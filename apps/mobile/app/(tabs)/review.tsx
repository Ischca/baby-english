import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Text, XStack, YStack } from "tamagui";
import { dueReviews } from "@shared/learning/engine";
import { useLearning } from "../../src/store";
import {
  Action,
  Body,
  Field,
  Frame,
  IconButton,
  Label,
  Title,
  ErrorNotice,
} from "../../src/kit";
import { EmptyWords, PopIn } from "../../src/game";
import { palette as c } from "../../src/theme";
import { speak } from "../../src/speech";

export default function Review() {
  const { progress, review } = useLearning();
  const [now, setNow] = useState(new Date());
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const queue = dueReviews(progress, now);
  const card = queue[0];
  function rate(rating: "again" | "hard" | "good") {
    if (!card || !revealed) return;
    review(card.id, rating);
    setRevealed(false);
    setAnswer("");
    setDone(done + 1);
    setNow(new Date());
  }
  return (
    <Frame title="ことばのポケット">
      {card ? (
        <YStack gap={18}>
          <XStack justifyContent="space-between">
            <Body small muted>
              見ないで、思い出してみよう。
            </Body>
            <Label>
              あと {queue.length} 枚 · {done} 枚できた
            </Label>
          </XStack>
          <YStack marginHorizontal={6} marginBottom={8}>
            <YStack
              position="absolute"
              left={9}
              right={9}
              bottom={-9}
              top={12}
              borderRadius={26}
              backgroundColor="#D1E2C9"
              borderWidth={1}
              borderColor="#BED3B5"
            />
            <YStack
              backgroundColor={c.white}
              borderRadius={26}
              borderWidth={1}
              borderBottomWidth={4}
              borderColor={c.line}
              padding={22}
              gap={22}
              minHeight={260}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Label>WORD CARD</Label>
                <Text color={c.green} fontSize={20}>
                  ✦
                </Text>
              </XStack>
              <Title small>{card.cue}</Title>
              <Field
                accessibilityLabel="復習の回答"
                value={answer}
                onChangeText={setAnswer}
                multiline
                placeholder="英語で言う、または書いてみる…"
                minHeight={80}
              />
              {!revealed ? (
                <Action
                  testID="reveal-review"
                  onPress={() => setRevealed(true)}
                >
                  表現を確認
                </Action>
              ) : (
                <PopIn>
                  <YStack gap={14}>
                    <XStack alignItems="center" gap={8}>
                      <YStack flex={1}>
                        <Text
                          fontSize={25}
                          lineHeight={34}
                          fontWeight="800"
                          color={c.green}
                        >
                          {card.phrase}
                        </Text>
                      </YStack>
                      <IconButton
                        name="volume-high-outline"
                        label="ゆっくり聞く"
                        onPress={() =>
                          speak(card.phrase, true, () =>
                            setError("音声を再生できませんでした。"),
                          )
                        }
                      />
                    </XStack>
                    <Body small muted>
                      自分で言えた？ 別の正しい表現でも大丈夫。
                    </Body>
                    <XStack flexWrap="wrap" gap={8}>
                      <Action compact secondary onPress={() => rate("again")}>
                        まだ難しい
                      </Action>
                      <Action compact secondary onPress={() => rate("hard")}>
                        少し迷った
                      </Action>
                      <Action
                        compact
                        testID="review-good"
                        onPress={() => rate("good")}
                      >
                        自分で言えた
                      </Action>
                    </XStack>
                  </YStack>
                </PopIn>
              )}
            </YStack>
          </YStack>
        </YStack>
      ) : (
        <YStack alignItems="center" paddingVertical={22} gap={16}>
          <EmptyWords />
          <Title small>
            {done
              ? "今日のことば、できた！"
              : progress.reviews.length
                ? "ことばは、ひと休み中。"
                : "最初のことばを集めよう。"}
          </Title>
          {done > 0 && (
            <Body small muted>
              All caught up. Well done.
            </Body>
          )}
          <Body small muted>
            {done
              ? `${done}つの表現を復習しました。次の復習まで、ひと休み。`
              : progress.reviews.length
                ? "覚え具合に合わせて、次の復習が届きます。"
                : "会話で使った表現が、このポケットに集まります。"}
          </Body>
          <Action
            compact
            icon="chatbubble-ellipses-outline"
            onPress={() => router.push("/")}
          >
            今日のミッションへ
          </Action>
        </YStack>
      )}
      {error && <ErrorNotice text={error} />}
      {!!progress.reviews.length && (
        <YStack gap={12}>
          <XStack justifyContent="space-between" alignItems="center">
            <Text color={c.ink} fontSize={16} fontWeight="800">
              集めたことば
            </Text>
            <Label>{progress.reviews.length} WORDS</Label>
          </XStack>
          <YStack backgroundColor={c.white} borderRadius={22} overflow="hidden">
            {progress.reviews.map((item, index) => (
              <XStack
                key={item.id}
                padding={16}
                gap={10}
                alignItems="center"
                borderBottomWidth={index < progress.reviews.length - 1 ? 1 : 0}
                borderColor={c.line}
              >
                <YStack
                  width={30}
                  height={36}
                  borderRadius={9}
                  backgroundColor={c.pale}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={12} color={c.green} fontWeight="800">
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </YStack>
                <YStack flex={1} gap={4}>
                  <Text fontSize={16} fontWeight="700" color={c.ink}>
                    {item.phrase}
                  </Text>
                  <Body small muted>
                    {item.cue}
                  </Body>
                  <Text fontSize={10} color={c.muted}>
                    次回{" "}
                    {new Date(item.dueAt).toLocaleString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · 復習 {item.repetitions}回
                  </Text>
                </YStack>
                <IconButton
                  label={`${item.phrase}を聞く`}
                  name="volume-medium-outline"
                  onPress={() =>
                    speak(item.phrase, false, () =>
                      setError("音声を再生できませんでした。"),
                    )
                  }
                />
              </XStack>
            ))}
          </YStack>
        </YStack>
      )}
    </Frame>
  );
}
