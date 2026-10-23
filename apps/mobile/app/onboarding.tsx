import { useState } from "react";
import { router } from "expo-router";
import { XStack, YStack } from "tamagui";
import {
  ProfileSchema,
  type LifeRoute,
  type Profile,
} from "@shared/learning/types";
import { placementQuestions } from "@shared/learning/curriculum";
import { placementStage } from "@shared/learning/engine";
import { useLearning } from "../src/store";
import {
  Action,
  Body,
  Field,
  Frame,
  Label,
  Meter,
  Panel,
  Title,
  ErrorNotice,
} from "../src/kit";
import { World } from "../src/World";

export default function Onboarding() {
  const save = useLearning((s) => s.profile);
  const [name, setName] = useState("");
  const [route, setRoute] = useState<LifeRoute>("baby");
  const [focus, setFocus] = useState<Profile["focus"]>("everyday");
  const [minutes, setMinutes] = useState<10 | 20 | 30>(10);
  const [question, setQuestion] = useState(-1);
  const [correct, setCorrect] = useState(0);
  const [error, setError] = useState("");
  const finish = (placement: number) => {
    const result = ProfileSchema.safeParse({
      name: name.trim(),
      route,
      focus,
      dailyMinutes: minutes,
      placement,
    });
    if (!result.success) {
      setError("呼び名を1〜24文字で入力してください。");
      setQuestion(-1);
      return;
    }
    save(result.data);
    router.replace("/");
  };
  if (question >= 0 && question < placementQuestions.length) {
    const q = placementQuestions[question]!;
    return (
      <Frame
        title="Find your first step."
        eyebrow="A QUICK CHECK"
        subtitle="文を読んで、自然な返答を選んでください。分からなくても大丈夫。"
      >
        <Meter value={question / placementQuestions.length} />
        <Label>{question + 1} / 5</Label>
        <Panel>
          <Title small>{q.prompt}</Title>
          {q.options.map((option, index) => (
            <Action
              secondary
              key={option}
              onPress={() => {
                setCorrect(correct + (index === q.answer ? 1 : 0));
                setQuestion(question + 1);
              }}
            >
              {option}
            </Action>
          ))}
          <Action secondary onPress={() => setQuestion(question + 1)}>
            分からない
          </Action>
        </Panel>
      </Frame>
    );
  }
  if (question >= placementQuestions.length)
    return (
      <Frame title="Your world is ready." eyebrow="LET'S BEGIN">
        <World age={placementStage(correct) * 3} />
        <Panel>
          <Title small>
            {placementStage(correct) === 0
              ? "First words から"
              : placementStage(correct) === 1
                ? "Little discoveries から"
                : "Out into the world から"}
          </Title>
          <Body>
            これは読み取りだけの簡易チェックです。英語年齢はアプリ内の進行目安で、実年齢やCEFR認定ではありません。会話で使えるか確かめながら進めましょう。
          </Body>
          <Action
            testID="finish-onboarding"
            onPress={() => finish(placementStage(correct))}
          >
            この地点から始める
          </Action>
          <Action secondary onPress={() => finish(0)}>
            0歳・最初の言葉から始める
          </Action>
        </Panel>
      </Frame>
    );
  return (
    <Frame
      title={"A little English.\nA whole new world."}
      eyebrow="BABY ENGLISH"
      subtitle="もうひとりの自分で、英語の世界を生きてみよう。"
    >
      <World />
      <Panel>
        <Label>YOUR ENGLISH SELF</Label>
        <Field
          accessibilityLabel="英語の世界での呼び名"
          placeholder="呼び名（例：Alex）"
          value={name}
          maxLength={24}
          onChangeText={setName}
        />
        <Body small muted>
          本名でなくても大丈夫。学習データはこの端末に保存されます。
        </Body>
      </Panel>
      <YStack gap={12}>
        <Title small>どちらの世界から？</Title>
        <XStack flexWrap="wrap" gap={12}>
          <YStack flex={1} minWidth={240}>
            <Action
              testID="choose-baby"
              secondary={route !== "baby"}
              onPress={() => setRoute("baby")}
              icon="sunny-outline"
            >
              Baby Life
            </Action>
            <Body small muted>
              赤ちゃんから世界を発見。物語と一緒に成長。
            </Body>
          </YStack>
          <YStack flex={1} minWidth={240}>
            <Action
              secondary={route !== "real"}
              onPress={() => setRoute("real")}
              icon="compass-outline"
            >
              Real Life
            </Action>
            <Body small muted>
              カフェ、旅先、仕事。すぐに使う場面から。
            </Body>
          </YStack>
        </XStack>
        <Body small muted>
          学ぶ技能は共通。あとからいつでも切り替えられます。
        </Body>
      </YStack>
      <Panel>
        <Label>MAKE IT YOURS</Label>
        <Body>まず英語を使いたい場面</Body>
        <XStack flexWrap="wrap" gap={10}>
          {(["everyday", "work", "travel"] as const).map((value, i) => (
            <Action
              key={value}
              secondary={focus !== value}
              onPress={() => setFocus(value)}
            >
              {["日常会話", "仕事", "旅行"][i]}
            </Action>
          ))}
        </XStack>
        <Body>1日の目標</Body>
        <XStack gap={10}>
          {([10, 20, 30] as const).map((value) => (
            <Action
              key={value}
              secondary={minutes !== value}
              onPress={() => setMinutes(value)}
            >
              {value}分
            </Action>
          ))}
        </XStack>
      </Panel>
      {error && <ErrorNotice text={error} />}
      <Action
        onPress={() => {
          if (!name.trim()) {
            setError("呼び名を入力してください。");
            return;
          }
          setCorrect(0);
          setQuestion(0);
        }}
      >
        2分でスタート地点を探す
      </Action>
      <Action secondary testID="start-from-zero" onPress={() => finish(0)}>
        0歳・最初の言葉から始める
      </Action>
    </Frame>
  );
}
