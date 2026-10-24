import Svg, { Circle, Ellipse, G, Path, Rect, Line } from "react-native-svg";
import { useEffect, useRef } from "react";
import { Animated, AccessibilityInfo } from "react-native";

export function World({
  age = 0,
  portrait = false,
  size = 56,
}: {
  age?: number;
  portrait?: boolean;
  size?: number;
}) {
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || !mounted) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, {
            toValue: -4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathe, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    });
    return () => {
      mounted = false;
      animation?.stop();
    };
  }, [breathe]);
  const shirt =
    age < 4
      ? "#E9B779"
      : age < 7
        ? "#95B5A1"
        : age < 11
          ? "#A3BFD2"
          : age < 15
            ? "#ACA0BF"
            : "#3E6953";
  return (
    <Animated.View
      style={{
        transform: [{ translateY: breathe }],
        width: portrait ? size : "100%",
        maxWidth: portrait ? size : 360,
        alignSelf: "center",
      }}
      accessibilityLabel={`英語年齢 ${age}、成長するアバター`}
    >
      <Svg
        width="100%"
        height={portrait ? size : 250}
        viewBox={portrait ? "113 18 140 140" : "0 0 360 250"}
      >
        <Circle cx={183} cy={120} r={104} fill="#ECF0DE" />
        <Circle cx={283} cy={49} r={21} fill="#EBC783" />
        <Path
          d="M270 18v-8m29 19 6-6m-5 40 8 5m-54-49-5-7"
          stroke="#D4AF68"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Ellipse cx={176} cy={220} rx={129} ry={11} fill="#DAE2CF" />
        <Path
          d="M59 213v-60m0 23c-24 0-26-18-22-24 18-2 22 10 22 24m0 10c23-1 28-17 23-24-20-1-23 13-23 24"
          stroke="#70957B"
          strokeWidth={3}
          fill="#9BB58B"
        />
        <Path d="M42 198h34l-7 22H49Z" fill="#BC8D6A" />
        <Rect
          x={280}
          y={184}
          width={25}
          height={34}
          rx={4}
          fill="#C7B6D1"
          transform="rotate(8 290 200)"
        />
        <Rect x={302} y={196} width={29} height={24} rx={4} fill="#D3B883" />
        <G transform={age >= 7 ? "translate(0 -10)" : "translate(0 0)"}>
          <Ellipse cx={158} cy={211} rx={29} ry={12} fill="#D6A58A" />
          <Ellipse cx={209} cy={211} rx={29} ry={12} fill="#D6A58A" />
          <Path
            d="M144 162q-25 0-31 25 4 18 21 0m88-25q25 0 31 25-4 18-21 0"
            stroke="#EDC6AA"
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
          <Rect
            x={141}
            y={139}
            width={84}
            height={74 + (age >= 7 ? 10 : 0)}
            rx={34}
            fill={shirt}
          />
          <Path d="M165 142q18 24 36 0" fill="#F9F4E7" />
          <Circle cx={130} cy={102} r={13} fill="#E7B99A" />
          <Circle cx={236} cy={102} r={13} fill="#E7B99A" />
          <Ellipse cx={183} cy={96} rx={57} ry={57} fill="#F2D2B4" />
          {age < 4 ? (
            <Path
              d="M179 42q-10-22 8-25 13 0 7 10"
              stroke="#705647"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <Path
              d="M128 78q-1-49 57-43 48-3 52 43-21-9-29-30-26 29-80 30"
              fill="#655345"
            />
          )}
          <Ellipse
            cx={152}
            cy={116}
            rx={12}
            ry={6}
            fill="#EBA994"
            opacity={0.55}
          />
          <Ellipse
            cx={214}
            cy={116}
            rx={12}
            ry={6}
            fill="#EBA994"
            opacity={0.55}
          />
          <Circle cx={163} cy={98} r={4} fill="#3D463D" />
          <Circle cx={204} cy={98} r={4} fill="#3D463D" />
          <Path
            d="M176 117q7 8 15 0"
            stroke="#8E5A4F"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          {age >= 11 && (
            <>
              <Rect
                x={148}
                y={88}
                width={29}
                height={22}
                rx={8}
                stroke="#596A60"
                strokeWidth={3}
                fill="none"
              />
              <Rect
                x={190}
                y={88}
                width={29}
                height={22}
                rx={8}
                stroke="#596A60"
                strokeWidth={3}
                fill="none"
              />
              <Line
                x1={177}
                y1={97}
                x2={190}
                y2={97}
                stroke="#596A60"
                strokeWidth={3}
              />
            </>
          )}
        </G>
        <Circle cx={104} cy={51} r={5} fill="#C4D6B3" />
        <Path
          d="M86 92h10m-5-5v10"
          stroke="#C4B475"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}
