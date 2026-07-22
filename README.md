# sqa-homework-shehroz-khan

Automated pre-login test suite for the Permission AI agent at **https://ask.permission.ai**, plus UX, data-layer, and AI-workflow write-ups. Built with Playwright.

## Setup

```bash
# Node 18+ required
npm install
npx playwright install chromium   # one browser only — keeps install fast

npm test                          # run all 8 tests (headless, against the live site)
npm run report                    # open the generated HTML report
```

That's it — no env vars, no secrets, no local server. The suite hits the live app.

## Test strategy (TL;DR)

- **Covered (8 tests):** landing, topic-pill click, free-text ASK, Shift+Enter, Enter-sends, empty-input guard, auth routing, mobile layout.
- **Part 2** (`tests/02-ask.spec.js`): assert the answer is present, on-topic, non-broken — never exact text.
- **Waiting strategy:** new agent bubble → send button returns (it's a *stop* button mid-stream) → text stabilizes. No fixed string/timeout.
- **Skipped on purpose:** exact-text asserts, post-login flows, multi-browser (Chromium only, for a fast install).
- **Divergence:** topic pills are post-login only (see [`FINDINGS.md`](artifacts/ux-evidence/FINDINGS.md)); the two pill tests auto-run if present, else skip-with-reason.

## Key decisions

- **Playwright** over Cypress/Selenium: best auto-waiting + web-first assertions for a streaming, non-deterministic UI, and native mobile emulation.
- **Wait on the app's own stream signal** (send↔stop button) instead of timeouts — the graded core.
- **No page objects** — one `utils/helpers.js`; the brief warns against a "cathedral" for 8 tests.
- **`workers: 2`** — the suite hits a shared live LLM backend; high concurrency caused false failures.
- **iPhone 13 emulated inline** (not a 2nd project) so the count stays at 8 real cases and install stays Chromium-only.
- **Pills gap treated as a finding, not a failure** — resilient tests that pass the day the feature returns.
- **CAPTCHA not automated** — signup/login are reCAPTCHA-gated; a human clears it once for the UX review.

## Known limitations

- **Runs against live prod, by design** (the brief tests the live pre-login app). A degraded/slow model backend could red the suite on a bad day — not the app's fault, not the test's. Mitigated with `workers: 2` + one CI retry.
- **How I'd stabilize for CI:** keep this live E2E on a nightly/quarantine lane (informs, doesn't block), and add a separate deterministic lane that mocks the streamed response to gate PRs. Release gate = the 4 required behaviors green.

## AI disclosure

See [`artifacts/ai-workflow.md`](artifacts/ai-workflow.md).

## Next steps (with 1–2 more days)

- Wire the suite into **GitHub Actions** (nightly + on PR); gate release on the 4 required behaviors.
- Add a **DeepEval** job for answer quality (relevancy + a faithfulness judge) on a fixed prompt set — model-drift detection outside the UI suite.
- Restore the **pill tests** to hard assertions once the feature returns, and add a golden-prompt regression set.

## Submission checklist

- [ ] Repo named `sqa-homework-shehroz-khan` and default branch is main
- [ ] README includes exact Setup + run commands (verified from a clean clone)
- [ ] README word count ≤ 500 (excluding commands/checkboxes)
- [ ] Max 8 tests; all 4 required behaviors covered
- [ ] artifacts/assertions.md included (≤ 300 words)
- [ ] artifacts/ux-review.md included (≤ 400 words, desktop + mobile, post-signup exploration, 3–5 prioritized improvements)
- [ ] artifacts/data-checks.md included (≤ 300 words + SQL: expected data, verification queries, one pipeline integrity check)
- [ ] artifacts/ai-workflow.md included (≤ 300 words, all 4 questions answered)
- [ ] artifacts/report/ included (or hosted link + screenshot)
- [ ] artifacts/demo.mp4 included (60–90 sec, narrated: suite + report + one Part 2 assertion explained)
- [ ] Commit history shows how the work evolved
