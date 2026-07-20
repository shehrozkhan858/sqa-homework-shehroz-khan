# Functional bugs found while exploring (post-login)

Concrete defects found by hand in the signed-in product. Kept here rather than in `ux-review.md` so that review stays a prioritized *UX* list within its 400-word limit — but these are real and reproducible.

## Bug 1 — "Mark all as read" deletes notifications instead of marking them read
- **Steps:** bell icon → open notifications → click **"Mark all as read"**.
- **Expected:** items remain, shown as read (greyed), with unread ones marked.
- **Actual:** the panel empties to **"No notifications yet"** — the *"You earned 25 ASK"* record is gone. It behaves like delete, and duplicates the separate **"Clear"** action next to it.
- **Impact:** users lose useful earning history; the label misdescribes the action.
- **Evidence:** [`notif-before-markread.png`](notif-before-markread.png) → [`notif-after-markread.png`](notif-after-markread.png).

## Bug 2 — Domain name field has no maximum length
- **Steps:** Wallet → **Add .ASK Domain** → type 64+ characters → **Search**.
- **Expected:** a sensible max length + validation (real domains are capped, and .ask labels have limits).
- **Actual:** the input has **no `maxlength`** and accepts 64+ chars; the search returns priced **"Add to Cart"** results for the absurd name, and the long string **overflows unwrapped** through the results and the checkout Order Summary.
- **Impact:** junk data can enter the cart/checkout and the layout breaks; a purchase built on an invalid name is a support/refund risk.
- **Evidence:** [`domain-no-maxlength.png`](domain-no-maxlength.png) (search results for a 40-char name) + the Order Summary screenshot showing the overflow.

## Bug 3 — A new search silently empties the cart (with a confusing 1-item limit)
- **Steps:** Redeem → **Get Started** → search a domain → **Add to Cart** (header shows **Cart (1)**, the item shows **Remove from Cart**) → try to add a second → toast: **"You can only have one domain in your cart"** → now **search anything else**.
- **Expected:** the cart keeps the added domain across searches; the 1-item cap is fine, but a new search must not discard the cart.
- **Actual:** the new search **resets the cart to 0** — the header drops from **Cart (1)** back to **Cart** and the added domain is silently lost.
- **Impact:** users lose their selection mid-purchase (often without noticing) → abandoned/lost sales; the "only 1 domain" rule + silent reset together make the flow feel broken.
- **Verification:** **confirmed.** Flow + the 1-item limit toast verified via automation; the full sequence (Cart (1) → limit toast → Cart 0 after a new search) confirmed by hand with screenshots.
- **Evidence:** [`cart-1-added.png`](cart-1-added.png) (Cart (1), "Remove from Cart") → [`cart-2-limit-toast.png`](cart-2-limit-toast.png) ("You can only have one domain in your cart") → [`cart-3-reset.png`](cart-3-reset.png) (Cart back to 0 after new search).

## Bug 4 — Clicking an empty cart redirects to the homepage
- **Steps:** with an empty cart, click the **Cart** control in the header.
- **Expected:** an empty-cart view ("your cart is empty", or the domains page).
- **Actual:** it redirects to the site root `https://ask.permission.ai/` — a dead-end that drops the user out of the purchase flow with no explanation. (`/cart` also 404s directly.)
- **Impact:** disorienting; a user who opens their cart to check it gets bounced to the home agent instead.

*Bugs 1–3 have screenshot evidence; Bug 4 is a reproducible redirect. Live product, 20 Jul 2026, Chromium.*
