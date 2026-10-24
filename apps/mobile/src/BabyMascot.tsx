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
          cx={122}
          cy={223}
          rx={50}
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
              { translateX: -39 * scale },
              { translateY: 40 * scale },
              { rotate: armAngle },
              { translateX: 39 * scale },
              { translateY: -40 * scale },
            ],
          }}
        >
          <G {...line}>
            {/* A small open palm and a short, rounded forearm share one outline. */}
            <Path
              d="M58 151C53 148 51 144 51 140L48 135C46 132 47 130 49 130C51 130 52 133 54 135L52 128C51 125 54 123 56 126L59 133L58 125C58 122 62 122 63 125L64 133L65 128C66 125 69 126 69 129L69 139L73 136C76 135 78 138 75 141L70 148C68 151 68 153 68 154C73 155 77 158 81 155C87 155 88 162 83 166C76 173 66 163 58 151Z"
              fill={skin}
            />
            <Path
              d="M68 141Q64 140 62 144"
              fill="none"
              stroke="#C99770"
              strokeWidth={1.6}
            />
          </G>
        </ArtLayer>
        <ArtLayer size={size}>
          <G {...line}>
            <Path
              d="M94 137C86 136 79 142 75 150L76 156Q81 161 87 157L99 146Z"
              fill={cream}
            />
            <Path
              d="M77 151Q82 155 87 153"
              fill="none"
              stroke="#D8C7A6"
              strokeWidth={1.8}
            />
            <Path d="M109 128V141Q123 148 136 141V128" fill={skin} />
            {/* A round belly and tucked knees keep the body smaller than the head. */}
            <Path
              d="M99 131C90 138 84 150 84 168C84 188 99 199 122 199C145 199 160 188 160 168C160 150 154 138 145 131Z"
              fill={green}
            />
            <Path
              d="M104 180C94 175 82 182 81 193C80 202 87 208 98 205L111 198"
              fill={green}
            />
            <Path
              d="M140 180C150 175 162 182 163 193C164 202 157 208 146 205L133 198"
              fill={green}
            />
            <Path
              d="M113 194Q122 198 131 194"
              fill="none"
              stroke="#789580"
              strokeWidth={1.8}
            />
            {/* The relaxed arm is equally short and plump, with a small curled hand. */}
            <Path
              d="M159 153C166 153 169 160 167 166C167 173 163 177 157 176C151 175 149 170 151 165L154 155Z"
              fill={skin}
            />
            <Path
              d="M150 138C158 138 165 144 165 153C164 159 157 162 153 158L145 147Z"
              fill={cream}
            />
            <Path
              d="M154 154Q159 156 163 152"
              fill="none"
              stroke="#D8C7A6"
              strokeWidth={1.8}
            />
            <Path
              d="M153 164Q158 164 157 169M161 170L161 172"
              fill="none"
              stroke="#C99770"
              strokeWidth={1.6}
            />
            <Path
              d="M101 137L99 154M143 137L145 154"
              fill="none"
              stroke="#749A80"
              strokeWidth={7}
            />
            <Circle cx={99} cy={153} r={3.2} fill="#F5CB77" strokeWidth={1.8} />
            <Circle
              cx={145}
              cy={153}
              r={3.2}
              fill="#F5CB77"
              strokeWidth={1.8}
            />
            <Path
              d="M113 170H131V177Q122 186 113 177Z"
              fill="#BBD8BB"
              stroke="#789580"
              strokeWidth={1.8}
            />
            <Path d="M105 131Q122 140 140 131L124 148Z" fill="#EFB278" />
            <Path
              d="M111 137L123 142L135 137"
              stroke="#D99962"
              strokeWidth={1.8}
              fill="none"
            />
            {/* Soft booties sit directly beneath the bent knees, close to the belly. */}
            <Path
              d="M85 198Q92 194 100 199L103 204Q93 207 84 204Z"
              fill="#92B89D"
            />
            <Path
              d="M159 198Q152 194 144 199L141 204Q151 207 160 204Z"
              fill="#92B89D"
            />
            <Path
              d="M89 198C80 197 74 205 76 214C78 223 95 226 104 218C113 211 107 201 99 200Z"
              fill={cream}
            />
            <Path
              d="M155 198C164 197 170 205 168 214C166 223 149 226 140 218C131 211 137 201 145 200Z"
              fill={cream}
            />
            <Path
              d="M79 214Q91 221 104 214M140 214Q153 221 165 214"
              fill="none"
              stroke="#D4BE9B"
              strokeWidth={1.5}
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
