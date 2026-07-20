# Finding: suggested-topic pills are post-login only

**Verified:** 18–20 Jul 2026 · **Target:** https://ask.permission.ai (pre-login) · **Tooling:** Playwright + Chromium, headless and headed.

## What the brief expects
Two required tests depend on pre-login "suggested-topic pills": *page loads with pills visible* and *clicking a suggested topic produces a response*.

## What I actually observed
The **pre-login** page renders only the agent greeting bubble + the ASK input — **no topic pills** — across:
- Desktop 1280 & 1366px, and mobile (iPhone-13 emulation)
- Multiple reloads, realistic Chrome UA, and both before/after dismissing the cookie banner

The pills **do exist — only after login**. The signed-in agent home shows a "Suggested topics:" row (e.g. *Check MY ASK Balance*, *Best way to earn ASK today*, *Help me maximize my rewards*, *Withdraw ASK Tokens*).

## Evidence (this folder)
- `prelogin-no-pills.png` — pre-login page, cookie banner dismissed, no pills.
- `mobile-post-login-pills.png` — logged-in mobile home with the four pills.
- `wallet-withdrawal-wall.png` — unrelated wallet finding (see ux-review.md).

## Decision
Automation must stay pre-login (per the brief), and the brief also warns against asserting on things that don't exist. So the two pill tests are written to:
- **Run and assert normally if pills are present** (broad `data-testid`-based locator in `tests/01-landing.spec.js`), and
- **Skip with this reason if absent**, rather than hard-fail on a product state I don't control.

Free-text ASK (`tests/02-ask.spec.js`) covers the same agent-response path in the meantime.

**If your build renders pills pre-login, the suite exercises both required behaviors automatically — no code change needed.** If it doesn't, this is a spec/product divergence worth confirming with the team.
