# Plan: Replace `body-parser` with Express 5 built-in middleware

## Context

The demo project (`demo/`) is the `extreme-carpaccio-server` used in the AI tech-debt presentation. It runs **Express 5.1.0** and depends on **`body-parser` ^2.2.0** purely for the two most common cases:

- `demo/app.js:21` — `app.use(bodyParser.json())`
- `demo/app.js:22` — `app.use(bodyParser.urlencoded({ extended: false }))`
- `demo/specs/app_integration_spec.js:33-34` — the same two calls inside the integration test bootstrap.

Express has shipped its own `express.json()` / `express.urlencoded()` middleware since 4.16.0; they are thin wrappers around the exact same `body-parser` code. Since we are already on Express 5, the standalone `body-parser` dependency is now redundant — it remains in the tree only as a transitive dependency of Express.

This task fits the presentation’s "compare-alternative" demo step: research the landscape, pick the right option, and remove a piece of dead-weight tech debt.

## Comparison

| Option | Perf | API compat (with current usage) | Migration effort | Maintenance | Verdict |
|---|---|---|---|---|---|
| **`express.json()` / `express.urlencoded()` (built-in)** | Identical — same code, same `body-parser` under the hood | 100% — same option signature; in Express 5, `extended` already defaults to `false`, matching our config | Trivial: drop one direct dep, replace 2 calls × 2 files | Maintained as part of Express core (5.2.1, May 2026) | **Recommended** |
| `body-parser` (status quo) | Baseline | Already in use | None | Still maintained (2.2.2, Apr 2026) | Redundant — adds a direct dep that just re-exports what Express already exposes |
| `raw-body` | Fastest / lowest level | Returns a `Buffer`; we'd have to re-implement JSON + urlencoded parsing | High | Maintained | Overkill — only worth it for webhook signature verification (Stripe/GitHub style), which we don't do |
| `co-body` | Comparable | Promise-based, designed for Koa; not Express middleware | Medium-high (wrapper needed) | Maintained but mostly Koa-oriented | Wrong ecosystem |
| `formidable` / `multer` | N/A | Multipart only | High | Maintained | Different problem (file uploads) — not what we use |

### Why "bundle size" isn't the real axis here
`body-parser` is a **server-only** dependency; nothing ships to the browser. The meaningful cost is the dependency surface in `node_modules` and `package.json`. Since `body-parser` is already pulled in transitively via Express, removing it from `dependencies` is a net reduction of one direct dep, zero new code, and zero runtime impact.

## Recommendation

**Adopt Express 5's built-in `express.json()` and `express.urlencoded()`** and remove the direct `body-parser` dependency. This is the lowest-risk, lowest-effort path with no behavioral change and one fewer thing to keep upgraded.

## Files to modify

1. **`demo/app.js`**
   - Line 5: remove `var bodyParser = require('body-parser');`
   - Line 21: `app.use(bodyParser.json())` → `app.use(express.json())`
   - Line 22: `app.use(bodyParser.urlencoded({ extended: false }))` → `app.use(express.urlencoded({ extended: false }))` (the `extended: false` is now also the Express 5 default, so it could be dropped — keep it explicit for readability)

2. **`demo/specs/app_integration_spec.js`**
   - Line 5: remove the `body-parser` require
   - Lines 33–34: same two replacements as above (the test already requires `express`, so no new import needed — confirm during implementation)

3. **`demo/package.json`**
   - Remove `"body-parser": "^2.2.0"` from `dependencies`.
   - Run `npm install` to refresh `package-lock.json`.

## Verification

From `demo/`:

1. `npm install` — confirm the lockfile updates cleanly and `body-parser` is no longer a top-level entry (it will still appear as a transitive dep of `express`, which is fine).
2. `npm run lint` — must pass.
3. `npm test` — the integration spec exercises the JSON + urlencoded paths; it must stay green.
4. `npm start` and hit a `POST` endpoint defined in `javascripts/routes.js` with both `Content-Type: application/json` and `application/x-www-form-urlencoded` payloads to confirm `req.body` is parsed identically.

## Sources

- [Express body-parser middleware docs](https://expressjs.com/en/resources/middleware/body-parser/)
- [Express 5 release notes / migration](https://expressjs.com/en/guide/migrating-5.html)
- [expressjs/body-parser on GitHub](https://github.com/expressjs/body-parser)
- [npm: body-parser](https://www.npmjs.com/package/body-parser)
- [DEV: You probably don't need body-parser in your Express apps](https://dev.to/taylorbeeston/you-probably-don-t-need-body-parser-in-your-express-apps-3nio)
