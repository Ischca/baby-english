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

/** A seated illustration: the forearm pivots at the elbow, the head at the neck. */
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
    inputRange: [-1, 0, 1],
    outputRange: ["-16deg", "0deg", "8deg"],
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
        {/* The forearm sits behind its sleeve so the elbow stays covered while waving. */}
        <ArtLayer
          size={size}
          testID="mascot-arm"
          style={{
            transform: [
              { translateX: -47 * scale },
              { translateY: 35 * scale },
              { rotate: armAngle },
              { translateX: 47 * scale },
              { translateY: -35 * scale },
            ],
          }}
        >
          <G {...line}>
            {/* Four fingers and an inward-facing thumb, joined to a single palm. */}
            <Path
              d="M49 134C44 132 40 129 38 124L32 114C29 110 30 107 33 107C35 107 36 110 39 114L35 104C34 100 36 98 38 99C41 99 42 104 44 110L42 100C42 97 44 95 47 96C50 97 50 104 51 110L52 102C53 98 57 99 58 102L58 116L62 112C65 110 68 113 66 116L61 125C59 130 57 133 56 135C63 141 69 147 77 151C81 155 78 162 72 163C64 166 54 149 49 134Z"
              fill={skin}
            />
            <Path
              d="M57 118Q52 118 51 123"
              fill="none"
              stroke="#C99770"
              strokeWidth={1.8}
            />
          </G>
        </ArtLayer>
        <ArtLayer size={size}>
          <G {...line}>
            {/* One short sleeve connects the raised forearm to its shoulder. */}
            <Path
              d="M93 138C84 136 76 141 70 149L68 154Q71 160 78 162L97 148Z"
              fill={cream}
            />
            <Path
              d="M70 149Q75 155 82 156"
              fill="none"
              stroke="#D8C7A6"
              strokeWidth={2}
            />
            <Path d="M109 128V143Q123 151 136 143V128" fill={skin} />
            {/* The torso and both bent trouser legs share one continuous silhouette. */}
            <Path
              d="M98 134Q122 127 146 134L160 173C177 172 188 182 189 195C190 207 179 215 165 212L139 205Q122 211 105 205L79 212C65 215 53 207 53 196C53 184 66 174 84 174Z"
              fill={green}
            />
            <Path
              d="M92 180Q84 185 80 196M152 180Q161 185 164 196"
              fill="none"
              stroke="#789580"
              strokeWidth={2.2}
            />
            {/* The other arm rests alongside the body, with its hand over the knee. */}
            <Path
              d="M159 156C162 164 164 170 164 175C159 174 157 177 160 181L164 186C169 191 178 190 181 184C185 177 177 163 173 155Z"
              fill={skin}
            />
            <Path
              d="M149 138C161 137 170 145 174 155Q170 162 159 163L148 151Z"
              fill={cream}
            />
            <Path
              d="M159 157Q166 157 172 153"
              fill="none"
              stroke="#D8C7A6"
              strokeWidth={2}
            />
            <Path
              d="M169 180L171 184M175 178L177 182"
              fill="none"
              stroke="#C99770"
              strokeWidth={1.8}
            />
            <Path
              d="M98 139L94 160M146 139L150 160"
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
            <Path d="M101 130Q121 141 146 130L123 153Z" fill="#EFB278" />
            <Path
              d="M105 136L122 145L140 136"
              stroke="#D99962"
              strokeWidth={2}
              fill="none"
            />
            {/* Short cuffs overlap the shoes, with both soles on the same ground plane. */}
            <Path d="M66 195Q78 192 87 202L82 211L61 206Z" fill="#92B89D" />
            <Path
              d="M176 195Q164 192 155 202L160 211L181 206Z"
              fill="#92B89D"
            />
            <Path
              d="M58 201C47 201 41 211 49 220C57 228 77 226 85 217C91 209 80 201 73 200Q65 198 58 201Z"
              fill={cream}
            />
            <Path
              d="M184 201C195 201 201 211 193 220C185 228 165 226 157 217C151 209 162 201 169 200Q177 198 184 201Z"
              fill={cream}
            />
            <Path
              d="M48 215Q62 224 82 214M160 214Q180 224 194 215"
              fill="none"
              stroke="#C8AB83"
              strokeWidth={2}
            />
          </G>
        </ArtLayer>
        <Animated.View
          testID="mascot-head"
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [
                { translateX: 2 * scale },
                { translateY: 13 * scale },
                {
                  rotate: tilt.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ["-1.8deg", "1.8deg"],
                  }),
                },
                { translateX: -2 * scale },
                { translateY: -13 * scale },
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
