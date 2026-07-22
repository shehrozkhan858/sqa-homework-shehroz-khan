// @ts-check
const { test, expect } = require('@playwright/test');
const { sel, openApp, askAndWaitForReply } = require('../utils/helpers');

/**
 * Required behavior #3 (free-text ASK -> response) AND all of Part 2
 * (validating a non-deterministic answer) live here. Topic: "What is
 * Permission?" — chosen because it has a knowable ground truth (Permission is a
 * personal-data broker that pays users for sharing data), so a correct answer
 * is checkable without pinning exact wording.
 *
 * See artifacts/assertions.md for the full rationale (what we assert vs skip).
 */
test('free-text ASK produces a relevant, non-broken answer', async ({ page }) => {
  await openApp(page);

  const reply = await askAndWaitForReply(page, 'What is Permission?');
  const text = (await reply.innerText()).trim();

  // 1. Non-empty and substantive — a blank or one-word reply is broken.
  expect(text.length).toBeGreaterThan(40);

  // 2. On-topic: any reasonable answer names the product AND its core concept
  //    (data or earning). This passes on wide paraphrase variety, fails on a
  //    generic "I can't help" or an answer about something else.
  expect(text).toMatch(/permission/i);
  expect(text).toMatch(/data|earn|reward|wallet|broker/i);

  // 3. Not an error / refusal / raw failure leaking to the user.
  expect(text).not.toMatch(
    /\b(error|undefined|null|NaN|traceback|exception)\b|something went wrong|try again later|i (?:can'?t|cannot) (?:help|assist)/i
  );

  // 4. The user's own message was echoed into the thread (round-trip intact).
  await expect(page.locator(sel.userMsg).last()).toContainText('What is Permission?');

  // 5. Input clears after send, ready for the next turn.
  await expect(page.locator(sel.input)).toHaveValue('');
});
