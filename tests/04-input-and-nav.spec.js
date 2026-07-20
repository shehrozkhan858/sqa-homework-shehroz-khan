// @ts-check
const { test, expect } = require('@playwright/test');
const { sel, openApp } = require('./helpers');

// Test #6 (my pick): empty / whitespace-only input must not fire a request.
// This is a real failure surface — an unguarded send wastes an LLM call and can
// push a junk row into the conversation table. More signal than a 2nd smoke test.
test('empty and whitespace-only input cannot be sent', async ({ page }) => {
  await openApp(page);
  const input = page.locator(sel.input);
  const send = page.locator(sel.send);
  const before = await page.locator(sel.agentMsg).count();

  // On load, with an empty box, the send control is disabled.
  await expect(send).toBeDisabled();

  // Whitespace only: still nothing sent, and Enter is a no-op too.
  await input.click();
  await input.fill('   ');
  await input.press('Enter');
  await expect(page.locator(sel.agentMsg)).toHaveCount(before);

  // Real text re-enables sending.
  await input.fill('hello');
  await expect(send).toBeEnabled();
});

// Test #7 (my pick): the only other pre-login surfaces are the auth entry
// points. Assert they route to real auth screens, not that a modal "looks
// right" — routing is the contract a broken deploy would break.
test('Log in and Sign Up route to their auth screens', async ({ page }) => {
  await openApp(page);

  await page.locator(sel.login).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByText(/log in to your account/i)).toBeVisible();

  await page.goto('/');
  await page.locator(sel.signup).click();
  await expect(page).toHaveURL(/\/register/);
  await expect(page.getByText(/create your account/i)).toBeVisible();
});
