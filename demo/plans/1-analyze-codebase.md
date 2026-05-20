# Tech Debt Analysis — `demo/` (extreme-carpaccio-server)

## Context

The user wants a full per-file technical-debt audit of the `demo/` folder, the legacy Node/Express app
that the AI-tech-debt presentation uses as a demo target. Output goes to
`demo/docs/tech-debt-analysis.md` (recreated; an older version was deleted on this branch). The
report needs file:line citations, severity, effort, remediation, and a prioritized action plan
(quick wins / blockers / long-term).

Scope intentionally **excludes** the slides infrastructure (`slides-*.md`, `pages/`, root
`package.json`).

## Plan of Action

1. Get user approval for the report content drafted below (via `ExitPlanMode`).
2. Create `demo/docs/` and write `demo/docs/tech-debt-analysis.md` with the content in the
   "Report content" section below.
3. No code changes. The report is documentation-only.

## Critical Files Read (already analysed)

- `demo/package.json`, `demo/bower.json`, `demo/.nvmrc`, `demo/.eslintrc`, `demo/configuration.json`
- `demo/app.js`, `demo/bin/www`
- `demo/javascripts/config.js`, `repositories.js`, `routes.js`, `utils.js`
- `demo/javascripts/services/{index,dispatcher,order,reduction,seller}.js`
- `demo/public/index.html`, `demo/public/javascripts/seller.js`
- `demo/specs/{services,repositories,app_integration}_spec.js`

## Verification

After writing, verify the markdown renders cleanly (`code --goto demo/docs/tech-debt-analysis.md`)
and the references hold: `grep -n "new Function" demo/javascripts/repositories.js`,
`grep -n "createClass\|getDOMNode\|componentWillReceiveProps" demo/public/javascripts/seller.js`,
`grep -n "_.shuffle" demo/javascripts/repositories.js`. The remediation suggestions are aligned with
the migration narrative in the existing slides (`slides-en.md`, `slides-fr.md`).

---

# Report content (to be written to `demo/docs/tech-debt-analysis.md`)

# Technical Debt Analysis — extreme-carpaccio-server

Generated: 2026-05-20. Source: `demo/` (Node.js + Express 5 backend, in-browser React 0.12 frontend
loaded via Bower). Node target: `24.11.1` (from `.nvmrc`).

Severity scale: **Critical** (security or correctness — fix now) · **High** (blocks modernization
or causes bugs) · **Medium** (smell, maintainability) · **Low** (style/cleanup).
Effort: rough story points (1 SP ≈ ½ day).

---

## 1. Security

### 1.1 Arbitrary code execution via `configuration.json` tax rules — **Critical** · 2 SP
- **Location**: `javascripts/repositories.js:152-154` (`customEval`), used at `:170` and `:193-205`.
- **Why**: `new Function('return ' + s)()` executes any JS string in `configuration.json` →
  `taxes`. Anyone able to write that file (or trigger it via the file-watch path) gets RCE inside
  the server process. `eslint-disable-line no-new-func` is acknowledging the smell without fixing
  it.
- **Fix**: replace the function-string contract with a declarative schema
  (`{ kind: "scale", factor: number } | { kind: "tiered", brackets: [...] }`). Validate with
  `zod`/`ajv`. Reject anything else. If "user-provided formula" is a hard product requirement, run
  it in a `vm.Script` with no globals **and** a CPU timeout — but prefer eliminating it.

### 1.2 Plaintext password storage and comparison — **Critical** · 2 SP
- **Location**: `javascripts/services/seller.js:48-72`, `javascripts/repositories.js:19-39`.
- **Why**: `seller.password === password` compares plaintext, and the password is stored verbatim
  in the in-memory map. It's also logged to stdout in `service.register` via `utils.stringify(seller)`
  (`seller.js:71`). The login flow doubles as registration (re-register-with-same-password is the
  auth check at `routes.js:34`), which couples two responsibilities and prevents rotation.
- **Fix**: hash with `argon2` or `bcrypt` (cost ≥ 12), compare via constant-time check
  (`crypto.timingSafeEqual`), redact `password` before any log line, and split register vs.
  re-register into two endpoints with distinct semantics.

### 1.3 No rate limiting / no CSRF protection — **High** · 1 SP
- **Location**: `app.js:19-24`, `javascripts/routes.js:27-40`.
- **Why**: `/seller` is an open POST. There's no rate limit on registration, no body-size cap, and
  no CORS policy. An attacker can brute force passwords or DoS the in-memory map.
- **Fix**: add `express-rate-limit`, set `express.json({ limit: '64kb' })`, configure `cors`
  explicitly. Cap `sellersMap` size.

### 1.4 Unvalidated seller URL — **High** · 1 SP
- **Location**: `javascripts/services/seller.js:59`, `routes.js:29`.
- **Why**: `new url.URL(sellerUrl)` is called without try/catch — a malformed URL throws and
  crashes the request handler in Express 5's promise chain. Worse, the URL is then used to make
  outbound HTTP calls (`utils.post`) with no allow-list. Internal services (`http://127.0.0.1:…`,
  `http://169.254.169.254/…` on cloud) become reachable → **SSRF**.
- **Fix**: validate the URL, reject non-`http`/`https`, reject private/loopback/link-local hosts
  (RFC1918, fc00::/7, 169.254/16, ::1, etc.) unless explicitly allow-listed for local workshops.

### 1.5 `bower` postinstall pulls deprecated packages from a deprecated registry — **High** · 1 SP
- **Location**: `package.json:9`, `bower.json:8-18`.
- **Why**: Bower is end-of-life (frozen ~2017). React 0.12.2 (2014), jQuery 2.1.3, Bootstrap 3.3.2,
  lodash 3.4.0, react-intl 1.1.0, chartjs 1.0.1, html5shiv, respond — every single one is years
  past its last security advisory. `postinstall: bower install` will silently fail or break new
  installs.
- **Fix**: see §3 (frontend rewrite). At minimum, drop the `postinstall` and commit the prebuilt
  vendor bundle until the rewrite lands.

---

## 2. Correctness Bugs

### 2.1 `_.shuffle` result discarded → country distribution is **not** shuffled — **High** · 1 SP
- **Location**: `javascripts/repositories.js:215`.
- **Why**: `_.shuffle(countryDistributionByWeight)` returns a **new** array but the result is
  ignored. The original array is left in insertion order (DE, DE, …, UK, UK, …). `_.sample`
  technically still picks uniformly so weights are preserved — but the *intent* (shuffle to avoid
  patterns) is silently broken and the line misleads readers.
- **Fix**: `countryDistributionByWeight = _.shuffle(countryDistributionByWeight)`; add a unit test
  asserting non-monotonic ordering.

### 2.2 `Sellers.save` update path loses fields and races with cash updates — **High** · 2 SP
- **Location**: `javascripts/repositories.js:19-39`.
- **Why**: `update()` does `sellersMap[name] = seller; sellersMap[name].cash = previousCash`. Any
  field absent from the new `seller` (e.g. `online`, `hostname`, `port`, `path`, `url`) is wiped.
  The repository test at `specs/repositories_spec.js:36-48` actually demonstrates this — only
  `cash` is preserved, `online`/`path`/`port`/`url` would be undefined after re-register. Combined
  with concurrent `updateCash` callbacks, this is a lost-update race.
- **Fix**: merge instead of replace (`Object.assign(existing, patch, { cash: existing.cash })`),
  and serialize writes per seller (single-threaded JS helps but the async http callbacks reorder).

### 2.3 `response.on('data', …)` parses each chunk as JSON — **High** · 1 SP
- **Location**: `javascripts/services/dispatcher.js:101-111`.
- **Why**: Node emits `'data'` per TCP chunk. The handler calls `utils.jsonify(sellerResponse)`
  on each chunk — large bodies trigger `JSON.parse('{"tot')` and throw, which gets reported back to
  the seller as an error even though the bill was valid. For small bills it happens to work
  because everything arrives in one chunk on loopback. Fragile.
- **Fix**: accumulate chunks (`let buf = ''; response.setEncoding('utf8'); on('data', c => buf += c); on('end', () => jsonify(buf))`)
  or switch the whole HTTP layer to `undici`/`fetch` and `await res.text()`.

### 2.4 `getCashHistory` chunking is off-by-one and produces wrong `lastIteration` — **Medium** · 1 SP
- **Location**: `javascripts/services/seller.js:22-46`.
- **Why**: The loop variable `i` advances only inside the `for`; after the loop, `i ===
  cashHistory[seller].length`. The "remaining iterations" branch reads `cashHistory[seller][i-1]`
  — fine — but `lastIteration` is assigned **inside** the `for…in` over sellers, so it ends up
  equal to the **last** seller's length, not the global iteration count. UI labels are wrong when
  sellers have different history lengths (which happens when they register at different times).
- **Fix**: compute `lastIteration` from the dispatcher's iteration counter, or take
  `Math.max(...allLengths)`. Replace the manual loop with `_.chunk` + `_.last`.

### 2.5 `Country.applyTax` passes an array to a unary function — **Medium** · 0.5 SP
- **Location**: `javascripts/repositories.js:139-141, 196, 200, 203`.
- **Why**: `scale(factor)` returns `price => price * factor`, but `applyTax` calls
  `this.taxRule([sum])`. Multiplying a one-element array by a number coerces via `Number(`[sum]`)`
  → works only because JS quietly stringifies and re-parses. If a user-defined function in
  configuration expects a number, `[sum] * factor` is wildly surprising. The `customEval` example
  `function(price) { return 1234; }` is unaffected only because it ignores its argument.
- **Fix**: pass the number directly: `this.taxRule(sum)`. Update the contract documentation.

### 2.6 `fs.readFileSync` inside `config.all()` runs on every hot path — **Medium** · 1 SP
- **Location**: `javascripts/config.js:43-51`, called from every `applyTax`, `corruptOrder`,
  `shouldSendOrders`, `getReductionPeriodFor`.
- **Why**: First call hits disk synchronously while the event loop is blocked, on the dispatcher's
  setTimeout cadence (every 1–10 s). Subsequent calls rely on `props` being populated by
  `watchFile`. Mixing sync read with async watcher is a recipe for stale state if the file is
  partially written.
- **Fix**: load eagerly in the constructor (sync, once, at boot) and let `watchFile` re-populate.
  Or move config to a typed module imported at boot, with reload via signal.

### 2.7 `Configuration.watch` ignores `watchOnce` — **Low** · 0.5 SP
- **Location**: `javascripts/config.js:53-59`.
- **Why**: `persistent: !watchOnce` controls whether the watcher keeps the event loop alive, not
  whether it fires once. Naming + behaviour mismatch.
- **Fix**: implement true single-shot via `fs.unwatchFile` after first callback, or drop the
  parameter (only called as `watch(..., false, 500)` in `app.js:26`).

---

## 3. Outdated Dependencies & Framework Versions

### 3.1 Frontend stack is a decade out of date — **Critical** · 8 SP
- **Location**: `public/index.html`, `public/javascripts/seller.js`, `bower.json`.
- **Why**: React 0.12 (2014), in-browser JSXTransformer (deprecated since React 0.14),
  `React.createClass`, `this.refs.X.getDOMNode()`, `componentWillReceiveProps`, string refs —
  every API used is removed in React 16+. Bootstrap 3, react-bootstrap 0.15, react-intl 1.x,
  chartjs 1.0 all have breaking releases multiple majors ahead. jQuery is imported only for a
  tooltip activator (`seller.js:248-250`) and a bootstrap dependency.
- **Fix**: rewrite as a Vite + React 19 + TypeScript SPA. Replace `Chart.js` 1.x with `chart.js` 4
  (or recharts). Replace `react-intl` with `Intl.NumberFormat` directly. Drop jQuery and Bootstrap
  3 (use Tailwind or shadcn/ui). This is the headline migration that justifies the codemod story
  in the presentation.

### 3.2 `body-parser` redundant under Express 5 — **Medium** · 0.5 SP
- **Location**: `app.js:5, 21-22`, `specs/app_integration_spec.js:5, 33-34`, `package.json:12`.
- **Why**: Express 5 ships `express.json()` and `express.urlencoded()` built in. The external
  `body-parser` dep duplicates that and adds a maintenance surface for nothing.
- **Fix**: replace with `app.use(express.json()); app.use(express.urlencoded({ extended: false }))`
  and remove from `dependencies`.

### 3.3 `url-assembler` for one URL construction — **Low** · 0.5 SP
- **Location**: `javascripts/services/seller.js:68`, imported in `repositories_spec` indirectly.
- **Why**: A whole dep to wrap `new URL()` once. The seller stores both a `UrlAssembler` and a
  hostname/port/path triple but only the latter is used by `utils.post`.
- **Fix**: drop the lib, store the parsed URL parts only.

### 3.4 `lodash` used for trivial operations — **Low** · 1 SP
- **Location**: ubiquitous (`_.map`, `_.isEmpty`, `_.isNumber`, `_.isString`, `_.forEach`,
  `_.random`, `_.sample`, `_.shuffle`, `_.reduce`, `_.fill`, `_.find`, `_.result`).
- **Why**: ~95% of usage has a native ES2022 equivalent. `_.isNumber` and `_.isString` mostly mask
  weak typing.
- **Fix**: codemod to native methods (`Array.prototype.map`, `??`, `typeof`, `Math.random`-based
  helpers). Keep lodash only for `_.sample`/`_.sortBy` if convenient, or write 3 lines each. This
  is the codemod demo in the talk.

### 3.5 Testing stack `jasmine-node` is abandoned — **High** · 3 SP
- **Location**: `package.json:7, 27`, all `specs/*_spec.js`.
- **Why**: `jasmine-node` last published 2018, uses Jasmine 1.x APIs (`spyOn(...).andReturn`,
  `runs`, `waitsFor`, `andCallFake`) which are gone from modern Jasmine and incompatible with
  Vitest/Jest. The `runs`/`waitsFor` polling style in `specs/app_integration_spec.js` is
  particularly brittle.
- **Fix**: migrate to **Vitest** (matches the TS rewrite well). Mechanical rewrites:
  `spyOn(x, 'y').andReturn(z)` → `vi.spyOn(x, 'y').mockReturnValue(z)`; `andCallFake` →
  `mockImplementation`; `runs/waitsFor` → `await` on supertest's returned promise.

### 3.6 ESLint 8 + `eslint-config-standard` ecosystem stagnated — **Medium** · 1 SP
- **Location**: `.eslintrc`, `package.json:21-26`.
- **Why**: ESLint 9 + flat config is the current standard; `standard` preset has lagged. The
  `.eslintrc` declares `react` plugin without rules and has `parserOptions.ecmaVersion: 2018`
  while the source uses ES2022 features sporadically.
- **Fix**: replace with `biome` (fast, opinionated) or ESLint 9 flat config + `@typescript-eslint`
  after TS migration.

---

## 4. Architecture & Code Smells

### 4.1 Pseudo-classes via `prototype = (function(){ … })()` IIFE — **Medium** · 3 SP
- **Location**: `repositories.js:42-101, 107-238`, `config.js:11-61`, `services/dispatcher.js:10-82,
  89-122, 133-232`.
- **Why**: The IIFE-wrapped prototype assignment was a 2014 idiom to share private helpers. It
  defeats `instanceof`, breaks IDE navigation, and produces functions like
  `BadRequest.prototype.updateSellersCash` that take `self` as their *first* parameter — a clear
  sign the author was fighting `this`-binding.
- **Fix**: convert to ES2022 classes with `#private` fields/methods. Type with TS.

### 4.2 Global module-level singletons make tests brittle — **Medium** · 2 SP
- **Location**: `javascripts/utils.js:46` (`module.exports = new Utils()`), `services/reduction.js:44-46`.
- **Why**: A shared `Utils` instance with an injectable `http` works only if every consumer
  imports the same instance; tests must `spyOn(utils, 'post')` which leaks across files unless
  carefully reset. `Reduction.STANDARD` is a singleton holding both the strategy and (unused)
  `sum`/`reduction` constructor params (line 22 — both ignored).
- **Fix**: export the class, instantiate per request/test. For reductions, export factory
  functions or constants without mutable state.

### 4.3 Mixed `var` / mixed quotes / mixed `'use strict'` — **Medium** · 2 SP
- **Location**: `app.js` (all `var`), `bin/www` (all `var`), `services/dispatcher.js:1-4` (`var` +
  `'use strict'` missing), `repositories.js:1` has it, `routes.js` doesn't, `config.js` doesn't.
  Quotes alternate between `'` and `"`.
- **Why**: `var` hoisting hides bugs; ESM-ish files should be uniformly strict; mixed quotes
  signals no auto-format.
- **Fix**: Run a `var → const/let` codemod (this is one of the presentation's headline demos),
  apply Prettier/Biome formatting in CI.

### 4.4 The dispatcher is god-class with timer, HTTP, scoring, and chaos logic — **High** · 5 SP
- **Location**: `javascripts/services/dispatcher.js` (whole file).
- **Why**: `Dispatcher` owns: scheduling (`setTimeout`), HTTP fan-out, response parsing,
  cash mutation callbacks, chaos engineering (`BadRequest`), and per-seller online status. The
  `updateSellersCash` method takes `self` as a parameter because closures fight `this`. The chaos
  modes are a hard-coded `switch` on integer ids. `SellerCashUpdater` is in the same file but
  unrelated.
- **Fix**: split into three modules — `scheduler`, `orderDispatcher`, `chaosEngine` — each with a
  single responsibility; pass an `httpClient` interface. Chaos modes become a strategy table.

### 4.5 Frontend logic and presentation conflated in one 251-line file — **Medium** · 3 SP
- **Location**: `public/javascripts/seller.js`.
- **Why**: One file, three React components, JSX served raw (compiled in-browser), inlined chart
  data shaping, color hashing, jQuery side effects at bottom. No tests, no types.
- **Fix**: split per component, extract `useSalesHistory` hook, move colour hashing to a util,
  remove jQuery via plain DOM or react-bootstrap successors.

### 4.6 No graceful shutdown or unhandled-rejection handling — **Medium** · 1 SP
- **Location**: `bin/www`.
- **Why**: `process.exit(1)` is fine for startup errors, but there's no `SIGTERM` handler, no
  `server.close`, no flush of in-memory state, no error trap on `unhandledRejection`. Under
  Kubernetes/PM2 this leaks connections.
- **Fix**: standard shutdown block (`process.once('SIGTERM', () => server.close(...))`),
  `process.on('unhandledRejection', …)`.

### 4.7 In-memory repository with no persistence — **Medium** · 3 SP (only if persistence is wanted)
- **Location**: `javascripts/repositories.js:6-40`.
- **Why**: All sellers and cash history vanish on restart. That may be intentional for a workshop,
  but it is undocumented. The history grows unbounded — `cashHistory[name]` is an array filled to
  the current iteration count, ~1 entry/sec → ~3600/hour. Long workshops will hit memory issues.
- **Fix**: either document the ephemerality + cap history length, or back with SQLite/Redis.

### 4.8 `enlargeHistory` uses `Array(n).push.apply(arr, old)` — **Low** · 0.5 SP
- **Location**: `repositories.js:53-57`.
- **Why**: Creates a sparse array of size `n`, then *appends* the old values starting at index `n`,
  so the result has length `n + old.length`. The subsequent `_.fill` operates on `[lastRecordedIteration,
  currentIteration)` indices which are now in the **sparse** region — luck plus how `_.fill`
  treats sparse arrays makes the test pass. The intent (resize-with-prior-data) is muddled.
- **Fix**: `const next = old.slice(); next.length = newSize; return next;` then fill.

### 4.9 Inconsistent error handling: bare `console.error`, silent catches, error swallowed in `utils.post` — **High** · 2 SP
- **Location**: `utils.js:40` (`onError || function () {}`), `config.js:17, 27`, `dispatcher.js:97-99`,
  `services/seller.js:108`.
- **Why**: Failures are logged then forgotten. There's no metric, no Sentry hook, no structured
  log. Network errors disappear into `function () {}`.
- **Fix**: introduce a logger (`pino`), require the caller to pass an error handler (or return a
  Promise and let the caller `.catch`), wire to a real observability backend.

### 4.10 Race in `dispatcher.startBuying` scheduling — **Medium** · 1 SP
- **Location**: `dispatcher.js:169-173, 209-230`.
- **Why**: `scheduleNextIteration` is called *after* `sendOrderToSellers` returns synchronously,
  not after the HTTP round trips complete. With `intervalInMillis = 1000` (HALF_PRICE) and slow
  sellers, iterations overlap → out-of-order cash updates. The `currentIteration` parameter passed
  to `updateCash` papers over it but the cash-history slot can be overwritten.
- **Fix**: await all outbound requests (or `Promise.allSettled`) before scheduling next; or move
  to a queue with explicit concurrency.

### 4.11 `app.js` wires everything at module top level — **Low** · 1 SP
- **Location**: `app.js:13-27`.
- **Why**: Side effects on require (timers, file watchers) make it impossible to import the app
  for testing without starting the dispatcher. Tests in `specs/app_integration_spec.js` rebuild
  the wiring manually — a sign the export is wrong.
- **Fix**: export a `createApp(deps)` factory; let `bin/www` and tests both call it.

### 4.12 Unused / commented assets — **Low** · 0.5 SP
- **Location**: `public/index.html:13-16` (`<!--[if lt IE 9]>` for IE8 support), `bower.json` deps
  for `respond` and `html5shiv`, `.bowerrc`.
- **Why**: Dead config targeting browsers no one supports.
- **Fix**: delete on frontend rewrite.

---

## 5. Performance

### 5.1 `countryDistributionByWeight` allocates ~1.1M-entry array on every `Countries` instantiation — **Medium** · 1 SP
- **Location**: `repositories.js:208-215`.
- **Why**: The sum of population weights is ~1.13M. `OrderService` constructor (`order.js:7`)
  builds a fresh `Countries` every time. Today, that happens once at boot — but any future
  per-request instantiation will balloon. `_.shuffle` on 1.1M entries is also a non-trivial CPU
  spike.
- **Fix**: precompute a small CDF (`[(country, cumulativeWeight), …]`) and binary-search a random
  draw. ~30 entries instead of 1.1M.

### 5.2 `fs.watchFile` polls every 500 ms — **Low** · 0.5 SP
- **Location**: `app.js:26`, `config.js:56`.
- **Why**: `fs.watchFile` is poll-based; `fs.watch` is event-driven. 500 ms × small file is fine
  on a workshop laptop, less fine on container filesystems.
- **Fix**: switch to `fs.watch` with debouncing.

### 5.3 In-browser JSX transform recompiles on every page load — **High** · (folded into §3.1)
- **Location**: `public/index.html:38, 42`.
- **Why**: `JSXTransformer.js` parses and transforms 6 KB of JSX in the browser on every load. It
  was deprecated in 2015 specifically for this reason.
- **Fix**: covered by the SPA rewrite.

---

## 6. Configuration & Tooling

### 6.1 `.nvmrc 24.11.1` but code is ES5-style — **Low** · 0.5 SP
- **Location**: `.nvmrc`, source files.
- **Why**: Targeting Node 24 with `var`-everywhere code wastes the runtime's capabilities and
  misleads contributors.
- **Fix**: codemod to modern JS (covered).

### 6.2 No CI test/lint in the demo folder — **Medium** · 1 SP
- **Location**: `.github/` lives at repo root, not in `demo/`.
- **Why**: Tech-debt regressions in `demo/` are not caught.
- **Fix**: add a `demo-ci.yml` workflow that runs `npm ci`, `npm run lint`, `npm test`.

### 6.3 `renovate.json` exists but is minimal — **Low** · 0.5 SP
- **Location**: `renovate.json` (repo root).
- **Why**: Renovate config is two lines; demo deps aren't tracked.
- **Fix**: extend the schedule and add the `demo/` workspace.

---

## Prioritized Action Plan

### Quick wins (high value, low effort)
1. **§3.2** Replace `body-parser` with built-in Express 5 helpers · 0.5 SP
2. **§2.1** Fix `_.shuffle` discarded result · 1 SP
3. **§2.5** Stop passing `[sum]` array to tax functions · 0.5 SP
4. **§4.6** Add `SIGTERM` shutdown + `unhandledRejection` trap · 1 SP
5. **§4.11** Export `createApp(deps)` factory · 1 SP
6. **§6.2** Add CI workflow for `demo/` · 1 SP

### Critical, blocks modernization
1. **§1.1** Eliminate `new Function` config eval — security blocker · 2 SP
2. **§1.2** Hash passwords; redact from logs · 2 SP
3. **§1.4** Validate seller URL + SSRF guard · 1 SP
4. **§2.2** Fix `Sellers.save` field loss + race · 2 SP
5. **§2.3** Buffer HTTP response body before parsing · 1 SP
6. **§3.5** Migrate tests from `jasmine-node` to Vitest · 3 SP

### Long-term refactor
1. **§3.1 / §4.5 / §5.3** Rewrite frontend as Vite + React 19 + TS SPA · 8 SP
   - Replaces Bower, JSXTransformer, jQuery, Bootstrap 3, react-intl, chart.js 1
2. **§3.4** Codemod `lodash` → native ES utilities · 1 SP (the talk's codemod showcase)
3. **§4.3** Codemod `var` → `const`/`let` · 1 SP (the talk's second codemod showcase)
4. **§4.1** Convert prototype-IIFE classes to ES2022 classes + TS · 3 SP
5. **§4.4** Split `Dispatcher` into scheduler / dispatcher / chaos modules · 5 SP
6. **§4.7** Persistence layer (optional, only if workshops want it) · 3 SP

Total: ~52 SP of identified work. Quick wins alone (5 SP) unblock the security audit; the
frontend rewrite (8 SP) is the biggest single lever and the natural home of the codemod
demonstrations the talk relies on.
