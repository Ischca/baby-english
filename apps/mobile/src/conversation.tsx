import { XStack, YStack, Text, Button } from "tamagui";
import type { Turn } from "@shared/learning/types";
import { normalizeAnswer } from "@shared/learning/engine";
import { PartnerAvatar } from "./game";
import { Icon, IconButton } from "./kit";
import { palette as c } from "./theme";
import { speak } from "./speech";

export function TutorMessage({
  text,
  partner,
  current = false,
  onError,
}: {
  text: string;
  partner: string;
  current?: boolean;
  onError?: (message: string) => void;
}) {
  return (
    <XStack alignItems="flex-start" gap={8}>
      <PartnerAvatar name={partner} size={32} />
      <YStack flexShrink={1} maxWidth="86%" gap={4}>
        <Text fontSize={10} fontWeight="700" color={c.muted} paddingLeft={3}>
          {partner}
        </Text>
        <YStack
          backgroundColor={c.white}
          borderRadius={21}
          borderTopLeftRadius={5}
          borderWidth={1}
          borderBottomWidth={2}
          borderColor={c.line}
          paddingHorizontal={15}
          paddingTop={12}
          paddingBottom={7}
          gap={5}
        >
          <Text
            fontSize={current ? 18 : 16}
            lineHeight={current ? 27 : 25}
            color={c.ink}
            fontWeight={current ? "600" : "400"}
          >
            {text}
          </Text>
          <XStack alignItems="center" gap={5}>
            <IconButton
              name="volume-medium-outline"
              size={44}
              label="聞く"
              onPress={() =>
                speak(text, false, () =>
                  onError?.(
                    "音声を再生できませんでした。端末の音声設定を確認してください。",
                  ),
                )
              }
            />
            {current && (
              <Button
                height={34}
                paddingHorizontal={10}
                backgroundColor={c.paper}
                borderWidth={0}
                borderRadius={12}
                color={c.muted}
                fontSize={11}
                accessibilityRole="button"
                onPress={() => speak(text, true)}
              >
                ゆっくり
              </Button>
            )}
          </XStack>
        </YStack>
      </YStack>
    </XStack>
  );
}
export function LearnerMessage({ text }: { text: string }) {
  return (
    <XStack justifyContent="flex-end" paddingLeft={44}>
      <YStack
        maxWidth="94%"
        backgroundColor={c.green}
        borderRadius={21}
        borderBottomRightRadius={5}
        paddingHorizontal={16}
        paddingVertical={12}
      >
        <Text color="white" fontSize={16} lineHeight={25}>
          {text}
        </Text>
      </YStack>
    </XStack>
  );
}
export function FeedbackMessage({
  turn,
  compact = false,
}: {
  turn: Turn;
  compact?: boolean;
}) {
  const corrected =
    normalizeAnswer(turn.feedback.recast) !== normalizeAnswer(turn.answer);
  if (compact && turn.feedback.accepted)
    return (
      <XStack justifyContent="flex-end" alignItems="center" gap={4}>
        <Icon name="checkmark-done" size={14} color={c.green} />
        <Text fontSize={10} color={c.muted}>
          {turn.feedback.source === "ai" ? "伝わりました" : "例文チェック OK"}
          {turn.helped ? " · ヒントあり" : ""}
        </Text>
      </XStack>
    );
  return (
    <YStack
      marginLeft={40}
      paddingHorizontal={13}
      paddingVertical={11}
      gap={6}
      borderRadius={17}
      backgroundColor={turn.feedback.accepted ? "#DFEDD8" : c.peach}
    >
      <XStack alignItems="center" gap={5}>
        <Icon
          name={turn.feedback.accepted ? "checkmark-circle" : "bulb-outline"}
          color={turn.feedback.accepted ? c.green : c.gold}
          size={16}
        />
        <Text fontSize={10} fontWeight="700" color={c.muted}>
          {turn.feedback.source === "ai"
            ? "ことばメモ · AI添削"
            : "ことばメモ · 例文練習"}
        </Text>
      </XStack>
      <Text color={c.ink} fontSize={13} lineHeight={20}>
        {turn.feedback.feedback}
      </Text>
      {(!turn.feedback.accepted || corrected) && (
        <Text fontSize={16} fontWeight="700" color={c.ink} lineHeight={24}>
          {turn.feedback.recast}
        </Text>
      )}
      {!compact && (
        <XStack justifyContent="space-between" alignItems="center" gap={5}>
          <Text flex={1} color={c.muted} fontSize={10} lineHeight={17}>
            {turn.helped ? "ヒントを使った練習として記録しました。" : ""}
          </Text>
          <IconButton
            name="volume-medium-outline"
            label="この表現を聞く"
            onPress={() => speak(turn.feedback.recast)}
          />
        </XStack>
      )}
    </YStack>
  );
}
