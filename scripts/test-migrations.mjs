import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Execute the actual migrations in PostgreSQL WASM. Supply only the Auth
// primitives normally installed by Supabase, then exercise the real policies.
const db = new PGlite();
const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
const sessionA = "33333333-3333-4333-8333-333333333333";
const sessionB = "44444444-4444-4444-8444-444444444444";
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
    INSERT INTO auth.users VALUES ('${a}'), ('${b}');`);
  const dir = "apps/edge/supabase/migrations";
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  assert.equal(
    new Set(files.map((f) => f.split("_")[0])).size,
    files.length,
    "Migration versions must be unique",
  );
  for (const file of files)
    await db.exec(await readFile(`${dir}/${file}`, "utf8"));
  await db.exec(`GRANT SELECT, INSERT, UPDATE ON public.users, public.sessions, public.messages, public.scores, public.vocabulary_lists TO anon, authenticated;
    INSERT INTO public.users(id) VALUES ('${a}'), ('${b}');
    INSERT INTO public.sessions(id,user_id,mission_type) VALUES ('${sessionA}','${a}','greetings'),('${sessionB}','${b}','greetings');
    INSERT INTO public.messages(session_id,role,content) VALUES ('${sessionA}','user','Hello'),('${sessionB}','user','Private');
    SET ROLE authenticated; SET request.jwt.claim.sub = '${a}';`);
  assert.deepEqual((await db.query("SELECT id FROM public.users")).rows, [
    { id: a },
  ]);
  assert.equal(
    (await db.query("SELECT * FROM public.sessions")).rows.length,
    1,
  );
  assert.deepEqual(
    (await db.query("SELECT content FROM public.messages")).rows,
    [{ content: "Hello" }],
  );
  await assert.rejects(
    db.query(
      `INSERT INTO public.messages(session_id,role,content) VALUES ('${sessionB}','user','attack')`,
    ),
    /row-level security/,
  );
  await assert.rejects(
    db.query(`SELECT public.consume_ai_budget('${a}')`),
    /permission denied/,
  );
  await db.exec("RESET ROLE; SET ROLE anon;");
  assert.equal((await db.query("SELECT * FROM public.users")).rows.length, 0);
  assert.equal(
    (await db.query("SELECT * FROM public.messages")).rows.length,
    0,
  );
  await assert.rejects(
    db.query("SELECT * FROM public.ai_daily_usage"),
    /permission denied/,
  );
  await db.exec("RESET ROLE; SET ROLE service_role;");
  for (let i = 0; i < 120; i++)
    assert.equal(
      (await db.query(`SELECT public.consume_ai_budget('${a}') AS allowed`))
        .rows[0].allowed,
      true,
    );
  assert.equal(
    (await db.query(`SELECT public.consume_ai_budget('${a}') AS allowed`))
      .rows[0].allowed,
    false,
  );
  assert.equal(
    (await db.query(`SELECT public.consume_ai_budget('${b}') AS allowed`))
      .rows[0].allowed,
    true,
  );
  console.log(
    "Migrations passed: fresh setup, user isolation, anonymous denial, write protection, and atomic 120-call budget.",
  );
} finally {
  await db.close();
}
