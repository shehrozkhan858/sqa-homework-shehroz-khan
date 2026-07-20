# AI workflow & disclosure

## Tools, and why these
I used **Claude Code (Opus)** as the main driver and **Playwright** as the framework. Claude Code over ChatGPT/Copilot for one reason: it can actually *run* a browser against the live site and iterate on what it sees, not guess selectors from a screenshot. Nearly every decision came from probing `ask.permission.ai`.

## Generated vs. rewritten
- **Generated with AI:** the Playwright scaffold, DOM-probe scripts, first-draft assertions, and artifact boilerplate.
- **Rewrote/corrected by hand:** the **waiting strategy** (the core), **which 8 tests** to keep, the assertion thresholds, and every write-up's specifics. The AI's generic first drafts were the "reads like a template" thing the brief rejects — I cut them.

## One thing the AI got wrong that I caught
Two, actually. (1) The AI's first wait for the streamed answer used `networkidle` + a fixed `waitForTimeout` — flaky by design against a token-by-token stream. I replaced it with the app's own signal: the send button swaps to a **stop** button while streaming and back when done, plus a text-length-stabilization poll. (2) The AI (and the brief) assumed **suggested-topic pills** exist pre-login. Probing showed **none** there — and exploring the signed-in product revealed the pills are a **post-login** feature. So I made those tests skip-with-reason and documented the real divergence instead of shipping two failing tests.

## Built by hand / didn't trust AI with
- **Test selection and the pills decision** — judgment calls the brief grades; I made them from observed behavior, not AI suggestion.
- **CAPTCHA** — signup *and* login are reCAPTCHA-gated. I did not automate around it (wrong, against ToS); the human clears it once, then I reuse the session.
- **Every factual claim** about the product (Web3 wallet, PostHog, the browser extension) — verified from real cookies/localStorage and the live DOM, never assumed.
