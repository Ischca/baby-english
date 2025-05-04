# ⚙️ Local Setup Guide

## Prerequisites
- Node ≥ 18, pnpm ≥ 9
- Supabase CLI ≥ 1.157
- Expo CLI ≥ 7

## Steps
1. Clone & install
   ```bash
   git clone <repo>
   cd baby-english
   pnpm install -w
   ```

2. Supabase

   ```bash
   supabase start
   supabase functions serve chat --no-verify-jwt --env-file ./.env.local
   ```
3. Mobile

   ```bash
   pnpm --filter apps/mobile expo start
   ```
4. Lint & Test

   ```bash
   pnpm lint && pnpm test
   ```
