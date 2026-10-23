import { useEffect, useState } from "react";
import { XStack, YStack } from "tamagui";
import { exportAnki } from "@shared/learning/storage";
import { hasCoach } from "@shared/api";
import { useLearning } from "../../src/store";
import { Action, Body, Field, Frame, Label, Panel, Title } from "../../src/kit";
import { saveText } from "../../src/export";

export default function Settings() {
  const {
    progress,
    profile: update,
    abandon,
    importBackup,
    loadError,
  } = useLearning();
  const profile = progress.profile;
  const [backup, setBackup] = useState("");
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<"restore" | "abandon" | null>(null);
  const [name, setName] = useState(profile?.name ?? "");
  useEffect(() => {
    setName(profile?.name ?? "");
  }, [profile?.name]);
  async function download(kind: "json" | "anki") {
    try {
      await saveText(
        kind === "json" ? "baby-english-backup.json" : "baby-english-anki.tsv",
        kind === "json"
          ? JSON.stringify(progress, null, 2)
          : exportAnki(progress),
        kind === "json" ? "application/json" : "text/tab-separated-values",
      );
      setMessage("書き出しました。");
    } catch {
      setMessage("書き出せませんでした。もう一度お試しください。");
    }
  }
  return (
    <Frame title="Make this world yours." eyebrow="SETTINGS">
      {profile && !loadError && (
        <>
          <Panel>
            <Label>YOUR ENGLISH SELF</Label>
            <Field
              accessibilityLabel="呼び名"
              value={name}
              onChangeText={setName}
              maxLength={24}
            />
            <Action
              secondary
              disabled={!name.trim()}
              onPress={() => {
                update({ ...profile, name: name.trim() });
                setMessage("呼び名を保存しました。");
              }}
            >
              呼び名を保存
            </Action>
            <Title small>Live another little life.</Title>
            <XStack flexWrap="wrap" gap={12}>
              {(["baby", "real"] as const).map((route) => (
                <Action
                  key={route}
                  secondary={profile.route !== route}
                  onPress={() => update({ ...profile, route })}
                >
                  {route === "baby" ? "Baby Life" : "Real Life"}
                </Action>
              ))}
            </XStack>
            <Body small muted>
              途中のミッションは開始時の世界で続きます。次のミッションから切り替わります。
            </Body>
          </Panel>
          <Panel>
            <Label>DAILY RHYTHM</Label>
            <XStack gap={10}>
              {([10, 20, 30] as const).map((dailyMinutes) => (
                <Action
                  key={dailyMinutes}
                  secondary={profile.dailyMinutes !== dailyMinutes}
                  onPress={() => update({ ...profile, dailyMinutes })}
                >
                  {dailyMinutes}分
                </Action>
              ))}
            </XStack>
            <XStack flexWrap="wrap" gap={10}>
              {(["everyday", "work", "travel"] as const).map((focus, i) => (
                <Action
                  key={focus}
                  secondary={profile.focus !== focus}
                  onPress={() => update({ ...profile, focus })}
                >
                  {["日常会話", "仕事", "旅行"][i]}
                </Action>
              ))}
            </XStack>
          </Panel>
        </>
      )}
      <Panel>
        <Label>CONVERSATION</Label>
        <Title small>
          {hasCoach() ? "AI tutor configured" : "Phrase practice ready"}
        </Title>
        <Body>
          {hasCoach()
            ? "AI添削を利用できます。回答と直前の会話を送信し、意図や自然な表現を確認します。応答に失敗した場合は、回答を残して再試行できます。"
            : "例文練習と復習は、APIキーなしで使えます。AI添削はSupabaseとOpenAIを設定したビルドで利用できます。"}
        </Body>
        <Body small muted>
          例文練習は用意された表現との照合です。AIの評価にも誤りがありえます。英語年齢はアプリ内の目安で、発音・CEFR・試験点数を測定するものではありません。
        </Body>
      </Panel>
      <Panel>
        <Label>YOUR DATA</Label>
        <Body>
          進捗と会話は、この端末・ブラウザに保存します。端末を変える前にバックアップを書き出してください。自動クラウド同期は行いません。
        </Body>
        <XStack flexWrap="wrap" gap={10}>
          <Action
            secondary
            disabled={loadError}
            onPress={() => void download("json")}
          >
            バックアップを書き出す
          </Action>
          <Action
            secondary
            disabled={!progress.reviews.length}
            onPress={() => void download("anki")}
          >
            Anki用TSVを書き出す
          </Action>
        </XStack>
        <Body small muted>
          Ankiではタブ区切りで読み込み、1列目を表、2列目を裏、3列目をタグに割り当てます。
        </Body>
        <Field
          accessibilityLabel="バックアップJSON"
          multiline
          minHeight={110}
          value={backup}
          onChangeText={setBackup}
          placeholder="復元するバックアップJSONを貼り付け"
        />
        <Action
          secondary
          disabled={!backup.trim()}
          onPress={() => setConfirm("restore")}
        >
          バックアップを復元
        </Action>
        {confirm === "restore" && (
          <YStack gap={12}>
            <Body>現在の端末の進捗を、このバックアップで置き換えます。</Body>
            <Action
              onPress={() => {
                try {
                  importBackup(backup);
                  setMessage("復元しました。");
                  setBackup("");
                  setConfirm(null);
                } catch {
                  setMessage(
                    "復元できません。Baby English v2のバックアップJSONを確認してください。",
                  );
                }
              }}
            >
              置き換えて復元する
            </Action>
            <Action secondary onPress={() => setConfirm(null)}>
              キャンセル
            </Action>
          </YStack>
        )}
      </Panel>
      {progress.active && (
        <Panel>
          <Body>
            途中のミッションがあります。完了したミッションの記録は残したまま、今回の途中経過だけ取り消せます。
          </Body>
          {confirm !== "abandon" ? (
            <Action secondary onPress={() => setConfirm("abandon")}>
              途中のミッションを取り消す
            </Action>
          ) : (
            <XStack gap={10}>
              <Action
                onPress={() => {
                  abandon();
                  setConfirm(null);
                }}
              >
                取り消す
              </Action>
              <Action secondary onPress={() => setConfirm(null)}>
                続ける
              </Action>
            </XStack>
          )}
        </Panel>
      )}
      {message && (
        <Panel tone="blue">
          <Body>{message}</Body>
        </Panel>
      )}
      <Body small muted>
        AI機能を使うと、入力した英文と会話履歴がSupabase経由でOpenAIに送られます。ブラウザ音声入力はブラウザの音声認識サービスを使用します。ネイティブの音声入力は録音を文字起こしに送信します。録音は学習履歴に保存しません。
      </Body>
    </Frame>
  );
}
