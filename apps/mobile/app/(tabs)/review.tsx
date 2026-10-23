import { useEffect, useState } from "react";
import { router } from "expo-router";
import { XStack, YStack } from "tamagui";
import { dueReviews } from "@shared/learning/engine";
import { useLearning } from "../../src/store";
import { Action, Body, Field, Frame, Label, Panel, Title } from "../../src/kit";
import { speak } from "../../src/speech";

export default function Review() {
  const { progress, review } = useLearning();
  const [now, setNow] = useState(new Date());
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState(0);
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
    <Frame
      title="Make it yours."
      eyebrow="REVIEW"
      subtitle="見る前に思い出す。短い一文を、声に出してみよう。"
    >
      {card ? (
        <>
          <Label>
            {queue.length} TO REVISIT · {done} DONE
          </Label>
          <Panel tone="blue">
            <Label>HOW WOULD YOU SAY THIS?</Label>
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
              <Action testID="reveal-review" onPress={() => setRevealed(true)}>
                表現を確認
              </Action>
            ) : (
              <YStack gap={18}>
                <Title small>{card.phrase}</Title>
                <Action secondary onPress={() => speak(card.phrase, true)}>
                  ゆっくり聞く
                </Action>
                <Body small muted>
                  今、自分で言えたかを正直に選びましょう。別の正しい表現でも大丈夫です。
                </Body>
                <XStack flexWrap="wrap" gap={10}>
                  <Action secondary onPress={() => rate("again")}>
                    まだ難しい
                  </Action>
                  <Action secondary onPress={() => rate("hard")}>
                    少し迷った
                  </Action>
                  <Action testID="review-good" onPress={() => rate("good")}>
                    自分で言えた
                  </Action>
                </XStack>
              </YStack>
            )}
          </Panel>
        </>
      ) : (
        <Panel tone="green">
          <Title small>
            {done ? "All caught up. Well done." : "A little room to grow."}
          </Title>
          <Body>
            {done
              ? `${done}つの表現を復習しました。次の復習は、覚え具合に合わせて届きます。`
              : progress.reviews.length
                ? "今すぐの復習はありません。次のミッションへ進んでみましょう。"
                : "ミッションで使った表現がここに集まります。まずは一度、話してみましょう。"}
          </Body>
          <Action onPress={() => router.push("/")}>今日のミッションへ</Action>
        </Panel>
      )}
      {!!progress.reviews.length && (
        <YStack gap={12}>
          <Title small>Your phrase collection</Title>
          {progress.reviews.map((item) => (
            <Panel key={item.id}>
              <Body>{item.cue}</Body>
              <Body>{item.phrase}</Body>
              <Body small muted>
                次回：
                {new Date(item.dueAt).toLocaleString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                · 復習 {item.repetitions}回
              </Body>
            </Panel>
          ))}
        </YStack>
      )}
    </Frame>
  );
}
