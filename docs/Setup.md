# セットアップ

## APIなしで学習する

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

初回に呼び名と世界を選びます。初めから取り組むなら「0歳」、既知の基礎を飛ばすなら5問の簡易チェックを選びます。途中の回答、ヒント利用、復習予定も端末に保存されます。

例文練習で別の正しい表現が不一致になる場合は、例文を確認するか、下記のAI添削を有効にしてください。入力文字列の曖昧な部分一致で正解扱いにはしません。

## Supabase / OpenAI

Supabase CLIをインストールし、利用するプロジェクトを指定します。

```bash
cd apps/edge
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
cp .env.example .env.local
# .env.local にサーバー側の OPENAI_API_KEY を入力する
supabase secrets set --env-file .env.local
supabase functions deploy coach --no-verify-jwt
supabase functions deploy transcribe --no-verify-jwt
```

`--no-verify-jwt` はゲートウェイの旧JWT検証を使用しない指定です。関数内部でSupabase Authの `getUser` を呼び、失効・不正なトークンを拒否します。認証を省略する指定として使用しているわけではありません。

Supabase DashboardのAuthentication設定で匿名サインインを有効にします。大勢に公開する場合はAuth側のレート制限・CAPTCHAとOpenAIプロジェクトの利用上限も設定してください。

```bash
# リポジトリのルートで
cp apps/mobile/.env.example apps/mobile/.env
# EXPO_PUBLIC_SUPABASE_URL と EXPO_PUBLIC_SUPABASE_ANON_KEY を入力
pnpm build
pnpm preview
```

`SUPABASE_SERVICE_ROLE_KEY` と `OPENAI_API_KEY` を `EXPO_PUBLIC_` 変数に設定してはいけません。

### 旧DBが存在する場合

旧マイグレーション2本は同じバージョン番号 `20250505` を持ち、語彙投入がテーブル作成より先に並ぶ状態でした。新規セットアップが可能なよう、順序を `20250505000000`（スキーマ）、`20250505000100`（語彙）に分けています。

すでに旧DBへ適用している場合は、バックアップを取得し、`supabase migration list` と実スキーマを照合してからマイグレーション履歴を修復してください。初期スキーマを既存DBへ無条件に再適用したり、`db reset` したりしないでください。新しいRLSマイグレーションは旧データを削除しませんが、旧ランダムUUIDとAuthユーザーの対応がない記録はクライアントから読めなくなります。必要な旧記録は管理者が対応を確認して移行してください。

v0関数 `chat` / `sessions` / `user` は現行アプリでは使用しません。以前公開済みなら新規エンドポイントに切り替えたあと、Supabase Dashboardで旧関数を無効化してください。

### 動作確認

1. 設定画面に「AI tutor configured」と出ること（ビルド設定の有無を示す表示）。
2. ミッションで「AI添削」を選び、例文にない同義表現で応答する。
3. 実際の応答が返ること、無効トークンは401になることを確認する。
4. 回線断で回答が残り、再試行・例文練習切り替えができることを確認する。
5. ネイティブ版では録音後の英文を確認してから送信する。マイク拒否時は文字入力で継続する。

音声認識は発音採点ではありません。ブラウザの音声入力はブラウザ側の認識サービスに依存し、読み上げの声はOS設定に依存します。

## 検証コマンド

`pnpm lint`、`pnpm typecheck`、`pnpm test:coverage`、`pnpm test:migrations`、`pnpm build`、`pnpm e2e:ci`。

`test:migrations` はPGlite上のPostgreSQLで実際のSQLを実行し、ユーザー分離・匿名アクセス拒否・120回の上限を検証します。Supabase Authそのものの実通信テストではありません。

## iOS / Android

`pnpm dev:mobile` はExpo開発サーバーを起動します。SDK 53対応の開発環境を使用してください。ストア配信には別途EASプロジェクト、アプリ識別子、署名設定が必要です。`apps/mobile/eas.json` は内部配布用APKのビルドプロファイルを用意していますが、署名済みビルドやストア審査の完了を意味しません。
