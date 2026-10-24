import { createClient } from "@supabase/supabase-js";
import type { Storage } from "./learning/storage.ts";
import { configureCoach } from "./coach.ts";

export function connectCoach(url: string, key: string, storage: Storage) {
  const client = createClient(url, key, {
    auth: {
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  let signingIn: Promise<string> | null = null;
  async function token(): Promise<string> {
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error("保存された認証を読み込めませんでした。");
    if (data.session) return data.session.access_token;
    if (!signingIn)
      signingIn = client.auth
        .signInAnonymously()
        .then(({ data, error }) => {
          if (error || !data.session)
            throw new Error(
              "匿名ログインに失敗しました。Supabaseの設定を確認してください。",
            );
          return data.session.access_token;
        })
        .finally(() => {
          signingIn = null;
        });
    return signingIn;
  }
  configureCoach({ url: url.replace(/\/$/, ""), key, token });
  return client;
}
