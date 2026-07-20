# Data-layer reasoning (inferred from the outside)

I can't see the DB, so this is reasoned purely from what the UI exposes: signup takes **email + password**, promises a **verification email**, gates with a **CAPTCHA**, and immediately grants a **100 ASK signup bonus** (wallet shows "100 ASK", "2% of 4,900 needed to withdraw"). The agent shows a **user bubble + a streamed agent bubble, each timestamped**, pre-login (anonymous).

## Tables I'd expect

- **users** — `id, email, password_hash, email_verified_at, created_at`
- **email_verifications** — `id, user_id, token_hash, sent_at, consumed_at`
- **wallets** — `id, user_id, balance, currency ('ASK')`
- **ledger_entries** — `id, user_id, amount, type ('signup_bonus'|'earning'|'referral'), created_at`
- **conversations** — `id, user_id (nullable — pre-login is anonymous), anon_session_id, created_at`
- **messages** — `id, conversation_id, role ('user'|'agent'), content, finish_reason, created_at`

Account creation writes a `users` row, an `email_verifications` row, a `wallets` row, and a `ledger_entries` signup-bonus of 100. Pre-login chat writes `conversations` + `messages`.

## Verification SQL

```sql
-- 1. Every user message got a non-empty agent reply, timestamps sane (same convo).
SELECT u.id
FROM messages u
LEFT JOIN messages a
  ON a.conversation_id = u.conversation_id AND a.role = 'agent' AND a.created_at >= u.created_at
WHERE u.role = 'user' AND u.created_at > now() - interval '1 hour'
  AND (a.id IS NULL OR a.content IS NULL OR a.content = '');       -- expect 0 rows

-- 2. No orphaned messages (every message points at a real conversation).
SELECT m.id FROM messages m
LEFT JOIN conversations c ON c.id = m.conversation_id
WHERE c.id IS NULL;                                                -- expect 0 rows

-- 3. Each new user has a wallet whose balance equals its ledger, incl. the 100 bonus.
SELECT us.id, w.balance, COALESCE(SUM(l.amount),0) AS ledger_sum
FROM users us
LEFT JOIN wallets w ON w.user_id = us.id
LEFT JOIN ledger_entries l ON l.user_id = us.id
WHERE us.created_at > now() - interval '1 day'
GROUP BY us.id, w.balance
HAVING w.balance IS NULL                                           -- no wallet, or
    OR w.balance <> COALESCE(SUM(l.amount),0)                      -- balance drifts from ledger, or
    OR SUM(CASE WHEN l.type='signup_bonus' THEN l.amount ELSE 0 END) <> 100;  -- bonus missing/wrong
```

## Downstream pipeline check

Before loading `messages` into analytics, **quarantine any agent row where `finish_reason <> 'stop'` or `content` is empty** — truncated/errored generations otherwise silently deflate "answer length" and "resolution" metrics, a data bug that masquerades as a product regression.
