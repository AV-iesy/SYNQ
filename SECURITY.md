# SYNQ Security Baseline

## Endpoint exposure model

The API must be reachable by the web application, so network visibility is not treated as authorization. The enforced model is:

- Public and rate-limited: `GET /api/health`, `POST /api/auth/register`, `POST /api/auth/login`.
- Authenticated: account, task, schedule, journal, AI generation, payment status, payment configuration, order creation, verification, and capture operations.
- User-owned: every task, schedule, journal, payment order, and payment record query is scoped with the authenticated user identifier.
- Server-only credentials: MongoDB, JWT, Groq, Razorpay secret, and PayPal secret values belong only in backend environment variables.

CORS is a browser control, not an authentication mechanism. Non-browser clients can reach the network service but cannot access private data without a valid, non-revoked token.

## Implemented controls

- Helmet security headers and disabled Express fingerprinting.
- Production-only origin allowlist with rejected unknown browser origins.
- No-store headers for every API response.
- JSON-only unsafe methods and a 64 KB request-body limit.
- Global, authentication, registration, AI, and payment rate limits.
- JWT algorithm, issuer, audience, expiry, user existence, and token-version verification.
- Server-side logout invalidation through per-user token versions.
- Bounded authentication inputs and bcrypt's 72-byte input limit.
- User-scoped database queries, strict field allowlists, schema validation on updates, bounded arrays/text, and paginated collection reads.
- AI timeout, response-size cap, JSON parsing, field allowlist, tag/time checks, chronological validation, and normalized output.
- Server-derived payment pricing, provider-state verification, user/order binding, currency and amount checks, timing-safe Razorpay HMAC comparison, local payment intents, unique provider transaction identifiers, and retry-safe fulfillment states.
- Frontend CSP, frame blocking, HSTS, referrer policy, permissions policy, and removal of backend/provider secrets from frontend environment files.
- Dependency lockfiles and zero known npm advisories at the latest audit.

## Deployment requirements

1. Set `NODE_ENV=production`, a 32-byte-or-longer random `JWT_SECRET`, an exact HTTPS `CLIENT_URL`, and all provider credentials in the backend host's secret manager.
2. Set only `VITE_API_BASE_URL` in the frontend environment. Never create a `VITE_` variable for a secret because Vite variables are client-visible.
3. Replace the placeholder production API URL and add the exact deployed API origin to the frontend CSP if it is not hosted under the currently permitted Render or Railway domains.
4. Build the new `PaymentRecord` unique indexes before accepting payment traffic.
5. Rotate any Groq credential pasted into chat, logs, tickets, or screenshots. The current source scan found no live-pattern Groq key in tracked text snapshots, but provider-side rotation is still the only reliable response to disclosure.
6. Coordinate a Git history cleanup before force-pushing. History rewriting changes commit identifiers and must not be performed silently on a shared repository.
7. Verify production CORS, CSP, registration/login throttling, token revocation, AI throttling, and both provider sandbox flows after deployment.

## Residual production work

- Add signed Razorpay and PayPal webhooks, asynchronous reconciliation, refunds, disputes, and alerts. Browser callbacks alone are not sufficient for financial operations.
- Move rate-limit state to a shared Redis-compatible store before running multiple API instances.
- Evaluate short-lived access tokens plus rotating HttpOnly refresh cookies. The current bearer token remains readable by JavaScript, so CSP and XSS prevention are essential.
- Add email verification, password reset, account recovery, optional MFA, and breached-password screening.
- Add user-level storage quotas and cursor-based range endpoints for large histories.
- Send structured security events to protected monitoring with token, prompt, journal, and payment-field redaction.
- Schedule SAST, secret scanning, dependency review, authorization tests, and payment/AI contract tests in CI.

## Incident response

If a secret is exposed: revoke it at the provider first, issue a new value through the backend secret manager, redeploy, verify the old value fails, search current files and Git history, and record the scope and timestamps. Removing a secret from the latest file does not remove it from Git history.
