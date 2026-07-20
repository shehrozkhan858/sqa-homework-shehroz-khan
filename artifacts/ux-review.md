# UX review — ask.permission.ai

**Scope:** pre-login agent + post-signup product (real account). Desktop 1366px + mobile via responsive emulation (iPhone 13, 390×844) — not a physical device.

## What works
- Post-login IA is coherent: one left nav (Agent · Data Enrichment Hub · Redeem · Referrals · Wallet · Settings) collapsing cleanly to a mobile hamburger + single column, no horizontal overflow.
- Agent behaves identically pre/post-login.
- Post-login home surfaces **starter pills** ("Check MY ASK Balance").

## What's rough / differs between form factors + flows
- **Pre-login is barren:** the public agent shows only a greeting + input — no pills, no examples. The suggested-topic pills exist *only after login*, so first-time visitors get nothing to click.
- **Heavy signup gate before any value:** clearing a CAPTCHA, verifying email, and meeting 5 password rules — all before ever seeing the product.

## Prioritized improvements

**1. Make the withdrawal wall honest up front.** *Observation:* signup grants 100 ASK, but withdrawal needs 4,900 (wallet: "2% collected"), the Withdraw button is disabled, and cashing out also needs ID verification (buried on Profile). *Why:* the product promises "earn," then hides a 49× cash-out wall — the fastest way to erode new-user trust and retention. *Change:* state the full requirement (threshold + ID verification) at first earn, and reframe the balance as "progress to withdrawal."

**2. Make the Checkout CTA prominent on the paid page.** *Observation:* on the .ask-domain Order Summary, the primary Checkout button is small and stranded in a narrow right column with dead space; the domain name overflows unwrapped. *Why:* it's the point of sale — a weak, easily-missed CTA loses completed purchases. *Change:* full-width primary Checkout under the summary; truncate long domains.

**3. Put starter pills on the pre-login agent.** *Observation:* pills guide only logged-in users; pre-login is blank. *Why:* pre-login is top-of-funnel — an empty box is a weak first impression and costs signups. *Change:* show 3–4 pre-login example prompts ("What is Permission?", "How do I earn?").

**4. Connect the wallet to the earning surfaces.** *Observation:* the wallet shows a disabled Withdraw and "2% collected," but nothing there links to the paths that raise the balance (Data Enrichment Hub, Redeem, Referrals). *Why:* the user is most motivated at the locked balance — yet has no next step there. *Change:* surface the earn actions on the wallet itself.

*Order rationale:* #1 churns all users (trust), #2 loses revenue at point of sale, #3 top-of-funnel acquisition, #4 in-app activation.

*Evidence + functional bug log:* [`ux-evidence/`](ux-evidence/).
