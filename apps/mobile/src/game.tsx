import { useEffect, useRef, type PropsWithChildren } from "react";
import { AccessibilityInfo, Animated, Image } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { palette as c } from "./theme";
import { Icon, type IconName } from "./kit";

// Metro requires a static asset reference for both native and web bundles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const worldArtwork = require("../assets/game/world-garden.png");
export function SceneArt({ height = 300 }: { height?: number }) {
  return (
    <Image
      source={worldArtwork}
      accessibilityIgnoresInvertColors
      accessibilityLabel="小さな家と庭、川が広がる英語の世界"
      style={{ width: "100%", height }}
      resizeMode="cover"
    />
  );
}
export function PartnerAvatar({
  name = "Mia",
  size = 44,
}: {
  name?: string;
  size?: number;
}) {
  const variant = name.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % 3;
  const hair = ["#78513F", "#46565D", "#BA7948"][variant]!;
  const base = ["#F9D9C7", "#DDEDD6", "#E8DDF3"][variant]!;
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 2}
      overflow="hidden"
      backgroundColor={base}
      borderWidth={2}
      borderColor="white"
      accessibilityLabel={`${name}のアバター`}
    >
      <Svg width="100%" height="100%" viewBox="0 0 80 80">
        <Circle cx={40} cy={40} r={40} fill={base} />
        <Path
          d="M13 86q0-27 27-27t27 27"
          fill={variant === 1 ? "#73A38D" : "#E9AD61"}
        />
        <Path d="M20 48V29q0-22 20-22t21 22v25Z" fill={hair} />
        <Ellipse cx={40} cy={37} rx={20} ry={23} fill="#F6D0AD" />
        <Path
          d="M20 32Q16 9 38 8q24-2 24 25-18-3-24-15-5 12-18 14"
          fill={hair}
        />
        <Circle cx={32} cy={38} r={2.3} fill="#3C453D" />
        <Circle cx={48} cy={38} r={2.3} fill="#3C453D" />
        <Ellipse cx={26} cy={45} rx={5} ry={3} fill="#EDAA96" />
        <Ellipse cx={54} cy={45} rx={5} ry={3} fill="#EDAA96" />
        <Path
          d="M35 47q5 6 10 0"
          fill="none"
          stroke="#A26752"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {variant !== 1 && (
          <>
            <Circle cx={60} cy={28} r={6} fill="#F5CE76" />
            <Circle cx={60} cy={28} r={2} fill="#E0A34E" />
          </>
        )}
        <Path d="m32 60 8 8 8-8" fill="#FFF5E0" />
      </Svg>
    </YStack>
  );
}
export function StatPill({
  icon,
  value,
  warm = false,
}: {
  icon: IconName;
  value: string | number;
  warm?: boolean;
}) {
  return (
    <XStack
      gap={5}
      alignItems="center"
      backgroundColor={warm ? c.peach : c.white}
      borderRadius={15}
      paddingVertical={8}
      paddingHorizontal={10}
    >
      <Icon name={icon} color={warm ? c.gold : c.green} size={17} />
      <Text fontSize={13} fontWeight="800" color={c.ink}>
        {value}
      </Text>
    </XStack>
  );
}
export function PopIn({ children }: PropsWithChildren) {
  const value = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let stopped = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (stopped) return;
      if (reduced) value.setValue(1);
      else
        Animated.timing(value, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }).start();
    });
    return () => {
      stopped = true;
      value.stopAnimation();
    };
  }, [value]);
  return (
    <Animated.View
      style={{
        opacity: value,
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
export function RewardStars({ complete }: { complete: boolean }) {
  return (
    <XStack
      justifyContent="center"
      alignItems="center"
      gap={12}
      paddingVertical={8}
    >
      {[0, 1, 2].map((i) => (
        <YStack key={i} y={i === 1 ? -10 : 0}>
          <Icon
            name={complete ? "star" : i === 1 ? "star" : "star-outline"}
            size={i === 1 ? 58 : 40}
            color={c.orange}
          />
        </YStack>
      ))}
    </XStack>
  );
}
export function EmptyWords() {
  return (
    <Svg width={110} height={100} viewBox="0 0 110 100">
      <Circle cx={55} cy={48} r={43} fill={c.pale} />
      <Rect
        x={23}
        y={28}
        width={54}
        height={54}
        rx={13}
        fill="#BED9BA"
        transform="rotate(-12 50 50)"
      />
      <Rect
        x={34}
        y={19}
        width={54}
        height={62}
        rx={13}
        fill="white"
        stroke={c.line}
        strokeWidth={2}
      />
      <Path
        d="m50 41 7 7 14-16"
        fill="none"
        stroke={c.green}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M47 61h28m-28 8h19"
        stroke="#CBDACE"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </Svg>
  );
}
