// @ts-check
const { test, expect } = require('@playwright/test');
const { sel, openApp, waitForSettledReply } = require('../utils/helpers');

test.describe('Keyboard submit semantics', () => {
  // Required behavior #4: Shift+Enter inserts a newline and does NOT send.
  test('Shift+Enter adds a newline and does not send', async ({ page }) => {
    await openApp(page);
    const input = page.locator(sel.input);
    const before = await page.locator(sel.agentMsg).count();

    await input.click();
    await input.type('line one');
    await input.press('Shift+Enter');
    await input.type('line two');

    // Value contains a real newline...
    await expect(input).toHaveValue(/line one\r?\nline two/);
    // ...and nothing was submitted: no new agent bubble, text still in the box.
    await expect(page.locator(sel.agentMsg)).toHaveCount(before);
    await expect(input).not.toHaveValue('');
  });

  // Test #5 (my pick): the complement — plain Enter DOES send. Proving both
  // halves of the keybind is the point; testing only Shift+Enter would let an
  // "Enter also makes a newline" regression pass unnoticed.
  test('Enter submits the message', async ({ page }) => {
    await openApp(page);
    const input = page.locator(sel.input);
    const before = await page.locator(sel.agentMsg).count();

    await input.click();
    await input.fill('What is Permission?');
    await input.press('Enter');

    const reply = await waitForSettledReply(page, before);
    expect((await reply.innerText()).trim().length).toBeGreaterThan(0);
    await expect(input).toHaveValue('');
  });
});
