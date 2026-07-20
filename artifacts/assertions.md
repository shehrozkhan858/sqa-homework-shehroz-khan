# Validating a non-deterministic answer

**Topic:** "What is Permission?" · **Code:** [`tests/02-ask.spec.js`](../tests/02-ask.spec.js) · **Wait strategy:** [`tests/helpers.js`](../tests/helpers.js) → `waitForSettledReply`

I picked this topic because Permission's answer has a knowable core — a personal-data broker that pays users for sharing data ("your personalized data broker… the more you share, the more you earn"). That gives a correct answer a checkable shape without pinning words.

## What I assert (and where)

1. **Substantive** — reply `> 40` chars; a blank or one-word bubble is broken. (`02-ask.spec.js:21`)
2. **On-topic** — matches `/permission/i` **and** `/data|earn|reward|wallet|broker/i`: names the product and a core concept. Passes wide paraphrase; fails off-topic/empty. (`:26-27`)
3. **No leaked failure** — does **not** match `error|undefined|null|NaN|traceback|exception|something went wrong|can't help`: catches stack traces and refusals reaching the user. (`:30-32`)
4. **Round-trip intact** — my message is echoed into the thread. (`:35`)
5. **Input resets** — box clears after send. (`:38`)

## What I deliberately do NOT assert

- **Exact wording, length, or sentence count** — non-deterministic; asserting it tests the model's mood, not the app (the trap in the brief).
- **Specific facts/numbers** (token names, payouts) — content-drift is a *model* regression, better caught by evals than a UI test.
- **Markdown/formatting or latency** — cosmetic and variable.

The line I draw: assert the *contract* (a relevant, safe, non-empty answer arrives, UI stays consistent); leave the *prose* to evals.

## Bonus — wiring into DeepEval

Outside this UI suite, one nightly check: capture the reply for a fixed prompt set and run DeepEval's `AnswerRelevancyMetric` plus a `GEval` "faithful description of Permission?" judge (threshold ~0.7). It scores semantic quality this regex can't, without hard-coding text — the UI suite gates *shipping the app*, the eval gates *model drift*.
