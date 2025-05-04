# 👶 Baby‑English MVP

“年齢 = 英語力” をゲーム化した英語学習モバイルアプリ (iOS/Android)。
LLM で対話しながら 0 歳 → 18 歳へ成長！

![banner](./docs/images/banner.png)

## ✨ Features
- **Age‑based Curriculum**: CEFR と語彙数をマッピング。
- **Vocabulary Gatekeeper**: 出力・入力ともに年齢相当語彙で制限。
- **Mission‑Driven Learning**: 色・数字・挨拶など実生活シーン別タスク。
- **LLM Scoring**: OpenAI Responses API で自動評価。

## 🏗️ Tech Stack
| Layer | Tech |
|-------|------|
| Client | React Native (Expo, TS) |
| Backend | Supabase Edge Functions (Deno TS) |
| DB | Postgres (Supabase) |
| LLM | OpenAI GPT‑4o / Responses API |

## 🚀 Quick Start
```bash
pnpm install -w
supabase start              # DB & Studio
supabase functions serve chat --no-verify-jwt --env-file ./.env.local &
pnpm --filter apps/mobile expo start

## 📜 License
MIT