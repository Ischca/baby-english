import { expect, test, type Page } from "@playwright/test";

async function onboard(page: Page) {
  await page.goto("/");
  await page.getByLabel("英語の世界での呼び名").fill("Alex");
  await page.getByTestId("start-from-zero").click();
  await expect(page.getByText("Hello, Alex.")).toBeVisible();
}
async function answer(page: Page, value: string) {
  await page.getByTestId("answer-input").fill(value);
  await page.getByTestId("send-answer").click();
  await expect(page.getByTestId("next-step")).toBeVisible();
  await page.getByTestId("next-step").click();
}
test("onboarding, mission, feedback, journal and reload form a complete learning loop", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await onboard(page);
  await page.getByTestId("start-lesson").click();
  await answer(page, "Hi!");
  await answer(page, "Yes, I am.");
  const thread = page.getByTestId("conversation-thread");
  await expect(thread.getByText("Hi!", { exact: true })).toHaveCount(1);
  await expect(thread.getByText("Yes, I am.", { exact: true })).toHaveCount(1);
  await expect(
    thread.getByText("I gave you a little teddy bear. What do you say?"),
  ).toBeVisible();
  const composer = page.getByTestId("conversation-composer");
  const beforeScroll = await composer.boundingBox();
  await thread.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect(thread.getByText("Hi!", { exact: true })).toBeInViewport();
  expect(await composer.boundingBox()).toEqual(beforeScroll);
  const viewport = page.viewportSize()!;
  expect(beforeScroll!.y + beforeScroll!.height).toBeLessThanOrEqual(
    viewport.height,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(viewport.width);
  await answer(page, "Thank you.");
  await answer(page, "Goodbye!");
  await expect(page.getByText("あいさつする、できました。")).toBeVisible();
  await page.getByTestId("back-home").click();
  await expect(page.getByText("English age 1", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("English age 1", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Journal" }).click();
  await expect(page.getByText("Hello, little world")).toBeVisible();
  await page.getByRole("button", { name: "会話と振り返りを見る" }).click();
  await expect(
    page.getByText("Thank you.", { exact: true }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("persists the current turn and does not mistake a hinted answer for mastery after reload", async ({
  page,
}) => {
  await onboard(page);
  await page.getByTestId("start-lesson").click();
  await answer(page, "Hello");
  await answer(page, "Yes");
  await page.getByRole("button", { name: "例文ヒント", exact: true }).click();
  await page.reload();
  await expect(
    page.getByText("I gave you a little teddy bear. What do you say?"),
  ).toBeVisible();
  await expect(
    page.getByText("例文を見た回答では、技能のクリア判定は行いません。"),
  ).toBeVisible();
  await answer(page, "Thank you");
  await answer(page, "Bye");
  await expect(page.getByText("表現に出会えたことも、一歩。")).toBeVisible();
  await page.getByTestId("back-home").click();
  await expect(page.getByText("English age 0", { exact: true })).toBeVisible();
});
test("switches lives without discarding progress and exports a valid backup", async ({
  page,
}) => {
  await onboard(page);
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Real Life", exact: true }).click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "バックアップを書き出す", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("baby-english-backup.json");
  await page.getByRole("tab", { name: "Today" }).click();
  await expect(
    page.getByText("Your first hello", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Settings" }).click();
  await page.getByLabel("バックアップJSON").fill("{broken");
  await page
    .getByRole("button", { name: "バックアップを復元", exact: true })
    .click();
  await page.getByRole("button", { name: "置き換えて復元する" }).click();
  await expect(
    page.getByText(
      "復元できません。Baby English v2のバックアップJSONを確認してください。",
    ),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Today" }).click();
  await expect(
    page.getByText("Your first hello", { exact: true }),
  ).toBeVisible();
});
test("reviews due cards and schedules them again without granting a second immediate reward", async ({
  page,
}) => {
  await onboard(page);
  await page.getByTestId("start-lesson").click();
  for (const value of ["Hello", "Yes", "Thanks", "Bye"])
    await answer(page, value);
  await page.evaluate(() => {
    const key = "baby-english.v2";
    const p = JSON.parse(localStorage.getItem(key)!);
    p.reviews.forEach((card: { dueAt: string }) => {
      card.dueAt = "2020-01-01T00:00:00.000Z";
    });
    localStorage.setItem(key, JSON.stringify(p));
  });
  await page.goto("/review");
  await page.getByTestId("reveal-review").click();
  await page.getByTestId("review-good").click();
  await page.getByTestId("reveal-review").click();
  await page.getByRole("button", { name: "まだ難しい", exact: true }).click();
  await expect(page.getByText("All caught up. Well done.")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("reveal-review")).toHaveCount(0);
});
test("corrupt local data is preserved and can be recovered from a validated backup", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("baby-english.v2", "not-json"),
  );
  await page.reload();
  await expect(
    page.getByText(
      "保存データを読み込めませんでした。元のデータは上書きしていません。再読み込みするか、バックアップを復元してください。",
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("baby-english.v2")),
  ).toBe("not-json");
  await page.getByLabel("バックアップJSON").fill(
    JSON.stringify({
      version: 2,
      profile: {
        name: "Restored",
        route: "baby",
        focus: "everyday",
        dailyMinutes: 10,
        placement: 0,
      },
      active: null,
      history: [],
      reviews: [],
      mastered: [],
      xp: 0,
      activity: {},
      updatedAt: new Date().toISOString(),
    }),
  );
  await page
    .getByRole("button", { name: "バックアップを復元", exact: true })
    .click();
  await page.getByRole("button", { name: "置き換えて復元する" }).click();
  await page.getByRole("tab", { name: "Today" }).click();
  await expect(page.getByText("Hello, Restored.")).toBeVisible();
});
test("placement begins at a useful chapter and later chapters remain locked", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("英語の世界での呼び名").fill("Alex");
  await page.getByRole("button", { name: "2分でスタート地点を探す" }).click();
  for (const value of [
    "Water, please.",
    "It is on the table.",
    "I went to the park.",
    "Could you speak more slowly?",
    "Because it is faster.",
  ])
    await page.getByRole("button", { name: value, exact: true }).click();
  await page.getByTestId("finish-onboarding").click();
  await expect(page.getByText("English age 6", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Journey" }).click();
  await expect(
    page.getByRole("button", { name: "前の章をクリア" }).first(),
  ).toBeDisabled();
});

test("illustrated mascot responds to a greeting and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await onboard(page);
  const pose = page.getByTestId("mascot-pose");
  const initial = await pose.getAttribute("style");
  await expect.poll(() => pose.getAttribute("style")).not.toBe(initial);
  await page
    .getByRole("button", { name: "赤ちゃんにあいさつ", exact: true })
    .click();
  await expect(page.getByTestId("mascot-greeting")).toHaveText("Hello!");
  await expect(page.getByTestId("mascot-greeting")).toBeHidden({
    timeout: 4000,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(pose).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page
    .getByRole("button", { name: "赤ちゃんにあいさつ", exact: true })
    .click();
  await expect(page.getByTestId("mascot-greeting")).toHaveText("Hello!");
  await expect(page.getByTestId("mascot-greeting")).toBeHidden({
    timeout: 4000,
  });
  await expect(pose).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  await page.getByRole("tab", { name: "Journey" }).click();
  await expect(page.getByTestId("baby-mascot")).toBeHidden();
});
