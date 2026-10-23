# Baby English

「赤ちゃんとして英語の世界に生まれ直す」英語学習アプリ。
**Baby Life / Real Life の2つの物語で、同じ18の技能を練習します。**

初回設定 → 簡易プレイスメント → 今日のミッション → 自力での応答 → 別場面への転移 → 振り返り → 間隔反復、までを通して利用できます。

## すぐに始める（APIキー不要）

Node.js 22 と pnpm 10.10.0 を使用します。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

表示されたURLをブラウザで開きます。スマートフォン用のExpo開発環境は `pnpm dev:mobile`。

```bash
pnpm build                 # apps/mobile/dist にWeb版を書き出す
pnpm preview               # http://localhost:4173
```

Web版はSPAです。静的ホスティングでは、存在しない画面パスを `index.html` にフォールバックさせてください。HTTPSで公開すると対応ブラウザの音声入力を利用できます。

## できること

- 英語の呼び名、学習目的、1日の目標、5問の簡易プレイスメント
- あいさつ／注文／感情／場所／趣味／過去／予定／聞き返し／紹介／進捗共有／誘い／問題説明／理由／比較／物語／交渉／会話の展開、全18ミッション
- Baby LifeとReal Lifeを、学習記録を保ったまま切り替え
- 4ターンの学習：ウォームアップ → 自分で表現 → 別の場面に応用
- 読み上げ、ゆっくり再生、対応ブラウザでの英語音声入力
- 例文ヒント、回答ごとのフィードバック、会話履歴
- 端末内保存、途中再開、JSONバックアップ復元、Anki用TSV書き出し
- 間隔反復：要練習は10分後、通常は翌日。自己評価で間隔を更新
- 認証つきAI添削／ネイティブ録音の文字起こし（接続設定が必要）

## 評価の意味

**例文練習**は用意した正解表現との照合です。同じ意味の別表現でも照合できないことがあります。自由な言い回しを練習するときはAI添削を使用してください。AI評価にも誤りはありえます。

**英語年齢**は、簡易プレイスメントで選んだ開始地点と、自力で使えた技能数に基づくアプリ内の進行目安です。実年齢、CEFR認定、TOEIC点数、発音能力を表すものではありません。最後の2ターンをヒントなしで使い、4ターン中3つ以上を満たすと技能をクリアします。繰り返し同じ単語を送っても年齢やXPは増えません。

進捗・会話・復習は端末内に保存します。**自動クラウド同期はありません。** 別端末へ移るときは設定からバックアップを書き出し、復元してください。

## AI添削を有効にする

詳しくは [セットアップ](docs/Setup.md) を参照してください。OpenAIキーはSupabaseのサーバー側にだけ設定し、アプリに埋め込まないでください。

1. Supabaseで匿名ログインを有効にする。
2. DBマイグレーションを適用し、`coach` と `transcribe` をデプロイする。
3. Supabase Secretsに `OPENAI_API_KEY` を設定する。モデルは `OPENAI_MODEL`（既定 `gpt-4o`）。
4. `apps/mobile/.env.example` を `.env` にコピーし、公開Supabase URLとanon keyを設定して再ビルドする。

JWTは各関数で `auth.getUser(token)` により検証します。クライアントの `userId` は信用しません。AI利用は認証ユーザーごとにUTC日付で120回／日、DB側で原子的に制限します。文字起こしも1回に数え、上限・失敗時は例文練習を続けられます。匿名アカウントの作り直しによる回避対策には、Supabase Authの登録レート制限やCAPTCHAを運用に合わせて設定してください。

## 開発・検証

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm test:migrations
pnpm build
pnpm exec playwright install chromium
pnpm e2e:ci
# Deno 2.x
 deno check --node-modules-dir=manual --config apps/edge/supabase/functions/deno.json \
   apps/edge/supabase/functions/coach/index.ts \
   apps/edge/supabase/functions/transcribe/index.ts
```

- `apps/mobile/app/`：Expo Routerの画面
- `apps/mobile/src/`：Tamagui UI、Zustand、端末保存、音声
- `packages/shared/src/learning/`：カリキュラム・学習エンジン・保存スキーマ
- `packages/shared/src/coach.ts` / `cloud.ts`：検証つきAPI境界・認証
- `apps/edge/supabase/functions/coach/` / `transcribe/`：DenoのAI境界
- `tests/e2e/`：デスクトップ・スマホ幅の通し操作

v0の `App.tsx` / `screens/` と旧Edge Functionsは履歴参照用に残しています。現行エントリーポイントは `src/bootstrap.ts` → Expo Routerです。旧版の「年齢ごとの禁止語彙」や公開状態の学習ログAPIは使用しません。

## 対応範囲

現在のカリキュラムは大人の基礎練習用です。18ミッションを終えたことだけで、英語の習得や上級レベルへの到達を意味しません。学習の転移と会話量を増やすための土台です。

ブラウザ版はテスト対象です。iOS/Android向けソースと音声導線はありますが、EAS実機ビルド、ストア配信、実際のマイク品質、実API応答はそれぞれ接続先・機器での確認が必要です。SDK 53対応の開発ビルドを使用し、ストアの最新Expo Goとの互換性を前提にしないでください。
