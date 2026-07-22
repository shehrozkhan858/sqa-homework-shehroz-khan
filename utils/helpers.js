// @ts-check
const { expect } = require('@playwright/test');

/**
 * Central selector map. The chat bubbles ship NO test ids (only the input,
 * send button, and header do), so agent/user messages are matched by the
 * Tailwind alignment classes the app uses: agent = justify-start, user =
 * justify-end, inside the .space-y-4 message list. Keeping them here means a
 * markup change is a one-line fix, not a hunt across specs.
 */
const sel = {
  input: '[data-testid="agent-chat-input"]',
  send: '[data-testid="agent-chat-input-send-button"]',
  stop: '[data-testid="agent-chat-input-stop-button"]',
  title: '[data-testid="ai-page-title"]',
  description: '[data-testid="ai-page-description"]',
  login: '[data-testid="log-in-button"]',
  signup: '[data-testid="sign-up-button"]',
  agentMsg: 'div.space-y-4 > div.justify-start',
  userMsg: 'div.space-y-4 > div.justify-end',
};

/** OneTrust cookie banner overlays the input; dismiss it before interacting. */
async function dismissCookies(page) {
  const accept = page.locator('#onetrust-accept-btn-handler');
  try {
    await accept.waitFor({ state: 'visible', timeout: 6000 });
    await accept.click();
    await accept.waitFor({ state: 'hidden', timeout: 6000 });
  } catch {
    // Banner is cookie-gated: on repeat visits it never renders. Not a failure.
  }
}

/** Open the landing page in a clean state, cookies handled, input ready. */
async function openApp(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await dismissCookies(page);
  await expect(page.locator(sel.input)).toBeVisible();
}

/**
 * Wait for the agent reply that follows `beforeCount` existing bubbles to
 * fully stream in, and return its locator. Used by both free-text sends and
 * pill clicks — anything that triggers a reply.
 *
 * Waiting strategy — why this and not a sleep or a string match:
 *   1. A NEW agent bubble appearing is the "reply started" signal.
 *   2. The app swaps the send button for a stop button WHILE streaming and
 *      swaps it back when done — so send-button-visible is the app's own
 *      "reply finished" signal. We wait on that, not on a fixed timeout.
 *   3. Belt-and-braces: poll the reply's text length until it stops growing,
 *      covering the rare case where a very fast reply never shows the stop
 *      button. Only then do we assert.
 * No fixed string, no fixed timing is ever asserted.
 */
async function waitForSettledReply(page, beforeCount) {
  const agentMsgs = page.locator(sel.agentMsg);

  // (1) a new agent bubble shows up
  await expect.poll(() => agentMsgs.count(), { timeout: 30_000 })
    .toBeGreaterThan(beforeCount);
  const reply = agentMsgs.last();

  // (2) streaming finished: the send button is back (it was replaced by stop)
  await page.locator(sel.send).waitFor({ state: 'visible', timeout: 75_000 });

  // (3) text has stopped growing
  let prev = -1;
  await expect.poll(async () => {
    const len = (await reply.innerText()).trim().length;
    const stable = len > 0 && len === prev;
    prev = len;
    return stable;
  }, { timeout: 60_000, intervals: [800, 800, 800] }).toBe(true);

  return reply;
}

/** Fill the ASK box, submit (button or Enter), and return the settled reply. */
async function askAndWaitForReply(page, question, { viaEnter = false } = {}) {
  const input = page.locator(sel.input);
  const before = await page.locator(sel.agentMsg).count();

  await input.click();
  await input.fill(question);
  if (viaEnter) {
    await input.press('Enter');
  } else {
    await page.locator(sel.send).click();
  }

  return waitForSettledReply(page, before);
}

module.exports = { sel, dismissCookies, openApp, waitForSettledReply, askAndWaitForReply };
