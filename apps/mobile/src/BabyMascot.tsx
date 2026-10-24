import {
  useCallback,
  useRef,
  useState,
  type ComponentProps,
  type PropsWithChildren,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Text } from "tamagui";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

const ink = "#705448";
const skin = "#FFE5BF";
const cream = "#FFF5DC";
const green = "#A3C8AC";
const line = {
  stroke: ink,
  strokeWidth: 3.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const timing = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, {
    toValue,
    duration,
    easing: Easing.inOut(Easing.sin),
    useNativeDriver: true,
    isInteraction: false,
  });

function ArtLayer({
  size,
  style,
  children,
  testID,
}: PropsWithChildren<{
  size: number;
  style?: ComponentProps<typeof Animated.View>["style"];
  testID?: string;
}>) {
  return (
    <Animated.View
      {...(testID ? { testID } : {})}
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 240 240" accessible={false}>
        {children}
      </Svg>
    </Animated.View>
  );
}

/** A small native vector rig: feet, body, arm, head and eyelids have independent pivots. */
export function BabyMascot({ size = 150 }: { size?: number }) {
  const breath = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const arm = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const canAnimate = useRef(false);
  const focused = useRef(false);
  const greeting = useRef<Animated.CompositeAnimation | null>(null);
  const greetingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [happy, setHappy] = useState(false);
  const scale = size / 240;

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      setHappy(false);
      let disposed = false;
      let reduced = true;
      let active = AppState.currentState === "active";
      let loops: Animated.CompositeAnimation[] = [];
      const stop = () => {
        loops.forEach((animation) => animation.stop());
        loops = [];
        greeting.current?.stop();
        if (greetingTimer.current) clearTimeout(greetingTimer.current);
        breath.setValue(0);
        tilt.setValue(0);
        blink.setValue(1);
        arm.setValue(0);
        wave.setValue(0);
        bounce.setValue(0);
        canAnimate.current = false;
      };
      const refresh = () => {
        stop();
        setHappy(false);
        if (reduced || !active || !focused.current) return;
        canAnimate.current = true;
        loops = [
          Animated.loop(
            Animated.sequence([
              timing(breath, 1, 2200),
              timing(breath, 0, 2200),
            ]),
          ),
          Animated.loop(
            Animated.sequence([
              timing(tilt, 1, 2800),
              timing(tilt, -1, 5000),
              timing(tilt, 0, 2500),
            ]),
          ),
          Animated.loop(
            Animated.sequence([
              Animated.delay(3400),
              timing(blink, 0, 90),
              timing(blink, 1, 130),
              Animated.delay(4700),
              timing(blink, 0, 85),
              timing(blink, 1, 120),
              Animated.delay(180),
              timing(blink, 0, 85),
              timing(blink, 1, 130),
            ]),
          ),
          Animated.loop(
            Animated.sequence([
              Animated.delay(5400),
              timing(arm, -0.24, 260),
              timing(arm, 0.18, 340),
              timing(arm, -0.18, 300),
              timing(arm, 0, 320),
            ]),
          ),
        ];
        loops.forEach((animation) => animation.start());
      };
      const motion = AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        (value) => {
          reduced = value;
          refresh();
        },
      );
      const appState = AppState.addEventListener("change", (value) => {
        active = value === "active";
        refresh();
      });
      void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
        if (!disposed) {
          reduced = value;
          refresh();
        }
      });
      return () => {
        disposed = true;
        focused.current = false;
        stop();
        motion.remove();
        appState?.remove();
      };
    }, [arm, blink, bounce, breath, tilt, wave]),
  );

  function greet() {
    setHappy(true);
    if (greetingTimer.current) clearTimeout(greetingTimer.current);
    greeting.current?.stop();
    wave.setValue(0);
    bounce.setValue(0);
    if (canAnimate.current) {
      greeting.current = Animated.parallel([
        Animated.sequence([
          timing(wave, -0.7, 180),
          timing(wave, 0.7, 230),
          timing(wave, -0.6, 230),
          timing(wave, 0.55, 230),
          timing(wave, -0.3, 180),
          timing(wave, 0, 200),
        ]),
        Animated.sequence([
          timing(bounce, 1, 230),
          timing(bounce, 0, 300),
          timing(bounce, 0.45, 180),
          timing(bounce, 0, 260),
        ]),
      ]);
      greeting.current.start();
    }
    greetingTimer.current = setTimeout(() => {
      if (focused.current) setHappy(false);
    }, 2200);
  }
  const armAngle = Animated.add(arm, wave).interpolate({
    inputRange: [-1, 1],
    outputRange: ["-25deg", "25deg"],
  });
  const lift = Animated.add(
    breath.interpolate({ inputRange: [0, 1], outputRange: [0, -1.8 * scale] }),
    bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6 * scale] }),
  );
  return (
    <Pressable
      testID="baby-mascot"
      accessibilityRole="button"
      accessibilityLabel="赤ちゃんにあいさつ"
      accessibilityHint="タップすると笑顔で手を振ります"
      onPress={greet}
      style={{ width: size, height: size }}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        style={StyleSheet.absoluteFillObject}
        accessible={false}
      >
        <Ellipse
          cx={121}
          cy={224}
          rx={67}
          ry={9}
          fill="#345B40"
          opacity={0.17}
        />
      </Svg>
      <Animated.View
        testID="mascot-pose"
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          { transform: [{ translateY: lift }] },
        ]}
      >
        <ArtLayer size={size}>
          <G {...line}>
            <Path
              d="M92 167C74 165 53 178 49 195C45 211 60 221 80 215L117 198Z"
              fill={green}
            />
            <Path
              d="M150 166C171 164 192 180 195 196C198 213 184 222 165 216L128 198Z"
              fill="#92B89D"
            />
            <Path
              d="M87 144C73 139 68 146 72 164L83 181L99 169Z"
              fill={cream}
            />
            <Path
              d="M154 143C169 140 176 149 178 166L164 178L151 167Z"
              fill={cream}
            />
            <Path
              d="M174 162C185 164 190 175 185 182C181 190 166 185 163 177L164 168"
              fill={skin}
            />
            <Path
              d="M94 135C98 129 143 128 150 136L165 175C174 197 153 208 124 208C92 208 72 197 81 176Z"
              fill={green}
            />
            <Path
              d="M98 139L92 162M146 139L152 162"
              fill="none"
              stroke="#749A80"
              strokeWidth={8}
            />
            <Circle cx={94} cy={159} r={3.5} fill="#F5CB77" strokeWidth={2} />
            <Circle cx={150} cy={159} r={3.5} fill="#F5CB77" strokeWidth={2} />
            <Path
              d="M111 174H135V183Q123 193 111 183Z"
              fill="#BBD8BB"
              stroke="#789580"
              strokeWidth={2}
            />
            <Path d="M101 130Q121 141 146 130L123 158Z" fill="#EFB278" />
            <Path
              d="M105 136L122 145L140 136"
              stroke="#D99962"
              strokeWidth={2}
              fill="none"
            />
            <Path
              d="M54 190C41 192 37 210 50 219C63 228 85 220 88 207C90 196 67 186 54 190Z"
              fill={cream}
            />
            <Path
              d="M186 190C199 193 203 211 190 219C177 228 156 220 154 207C152 196 173 186 186 190Z"
              fill={cream}
            />
            <Path
              d="M46 211Q63 222 82 210M161 211Q178 222 195 210"
              fill="none"
              stroke="#C8AB83"
              strokeWidth={2}
            />
          </G>
        </ArtLayer>
        <ArtLayer
          size={size}
          testID="mascot-arm"
          style={{
            transform: [
              { translateX: -41 * scale },
              { translateY: 30 * scale },
              { rotate: armAngle },
              { translateX: 41 * scale },
              { translateY: -30 * scale },
            ],
          }}
        >
          <G {...line}>
            <Path
              d="M82 145C72 139 67 130 63 122L49 127C50 143 60 157 73 163Z"
              fill={cream}
            />
            <Path
              d="M58 130C48 132 40 124 39 117C38 112 42 110 45 113L47 115L44 105C43 100 48 98 51 103L55 110L54 98C54 94 60 94 61 99L63 110L66 103C68 100 73 102 71 107L68 121C67 127 63 130 58 130Z"
              fill={skin}
            />
            <Path d="M52 134L64 129" stroke="#D8C7A6" strokeWidth={2} />
          </G>
        </ArtLayer>
        <Animated.View
          testID="mascot-head"
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [
                {
                  rotate: tilt.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ["-1.8deg", "1.8deg"],
                  }),
                },
              ],
            },
          ]}
        >
          <ArtLayer size={size}>
            <G {...line}>
              <Ellipse cx={65} cy={91} rx={11} ry={13} fill={skin} />
              <Ellipse cx={180} cy={91} rx={11} ry={13} fill={skin} />
              <Path
                d="M65 80C65 47 86 28 121 28C157 28 180 49 180 81C183 116 160 136 124 136C87 136 63 116 65 80Z"
                fill={skin}
              />
              <Path
                d="M112 29C104 26 105 17 112 15C119 13 126 18 127 23C134 19 142 22 142 28C134 34 120 34 112 29Z"
                fill="#A7825C"
                strokeWidth={2.6}
              />
              <Ellipse
                cx={83}
                cy={107}
                rx={10}
                ry={6}
                fill="#EEB397"
                opacity={0.65}
                stroke="none"
              />
              <Ellipse
                cx={161}
                cy={107}
                rx={10}
                ry={6}
                fill="#EEB397"
                opacity={0.65}
                stroke="none"
              />
              <Path
                d="M121 103Q124 105 127 103"
                fill="none"
                stroke="#C99770"
                strokeWidth={2}
              />
              {happy ? (
                <>
                  <Path
                    d="M115 112Q124 116 133 112Q133 124 124 125Q115 124 115 112Z"
                    fill="#9B6752"
                    strokeWidth={2.3}
                  />
                  <Path
                    d="M119 122Q124 118 130 122"
                    fill="#E7A387"
                    stroke="none"
                  />
                </>
              ) : (
                <Path
                  d="M116 113Q124 122 132 113"
                  fill="none"
                  strokeWidth={2.6}
                />
              )}
            </G>
          </ArtLayer>
          <ArtLayer
            size={size}
            testID="mascot-eyes"
            style={{
              transform: [
                { translateY: -25 * scale },
                {
                  scaleY: blink.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.08, 1],
                  }),
                },
                { translateY: 25 * scale },
              ],
            }}
          >
            {happy ? (
              <G
                fill="none"
                stroke={ink}
                strokeWidth={3.3}
                strokeLinecap="round"
              >
                <Path d="M97 96Q101 89 105 96M143 96Q147 89 151 96" />
              </G>
            ) : (
              <G fill={ink}>
                <Ellipse cx={101} cy={95} rx={3.7} ry={4.7} />
                <Ellipse cx={147} cy={95} rx={3.7} ry={4.7} />
              </G>
            )}
          </ArtLayer>
        </Animated.View>
      </Animated.View>
      {happy && (
        <View
          testID="mascot-greeting"
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -12,
            right: -8,
            paddingHorizontal: 11,
            paddingVertical: 7,
            borderRadius: 14,
            borderBottomLeftRadius: 3,
            backgroundColor: "#FFF9EA",
            borderWidth: 1,
            borderColor: "#DACBAA",
          }}
        >
          <Text color="#42634B" fontSize={12} fontWeight="700">
            Hello!
          </Text>
        </View>
      )}
    </Pressable>
  );
}
