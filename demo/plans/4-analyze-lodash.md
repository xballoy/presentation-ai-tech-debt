# Lodash Usage Analysis — `demo/` (backend + specs)

## Context

The `demo/` project (`extreme-carpaccio-server`, Express 5 + Node) depends on `lodash ^4.17.21`. We want to know which lodash calls can be replaced with native JS APIs, so we can shrink the dependency surface (and ultimately drop lodash). This document is **analysis only** — no code changes. Scope: `demo/javascripts/**` (production) and `demo/specs/**` (tests).

## Inventory

37 lodash call sites across 9 files (29 production + 8 spec), using **21 distinct functions**.

| # | Function | Calls | Files |
|---|---|---|---|
| 1 | `_.isEmpty` | 5 | `config.js:46`, `routes.js:32` (x3), `services/seller.js:88` |
| 2 | `_.size` | 4 | `specs/repositories_spec.js:150-153` |
| 3 | `_.map` | 3 | `repositories.js:13`, `routes.js:12`, `services/dispatcher.js:30` |
| 4 | `_.isNumber` | 3 | `services/order.js:57`, `repositories.js:163`, `services/dispatcher.js:139` |
| 5 | `_.random` | 3 | `services/order.js:20,26,28` |
| 6 | `_.reduce` | 2 | `repositories.js:208,217` |
| 7 | `_.sample` | 2 | `repositories.js:226`, `services/dispatcher.js:21` |
| 8 | `_.every` | 2 | `specs/services_spec.js:187,190` |
| 9 | `_.has` | 1 | `services/order.js:53` |
| 10 | `_.sortBy` | 1 | `repositories.js:16` |
| 11 | `_.fill` | 1 | `repositories.js:68` |
| 12 | `_.isString` | 1 | `repositories.js:168` |
| 13 | `_.isFunction` | 1 | `repositories.js:171` |
| 14 | `_.shuffle` | 1 | `repositories.js:215` |
| 15 | `_.result` | 1 | `services/reduction.js:36` |
| 16 | `_.find` | 1 | `services/reduction.js:36` |
| 17 | `_.clone` | 1 | `services/dispatcher.js:22` |
| 18 | `_.range` | 1 | `services/dispatcher.js:30` |
| 19 | `_.forEach` | 1 | `services/dispatcher.js:194` |
| 20 | `_.times` | 1 | `specs/repositories_spec.js:146` |
| 21 | `_.groupBy` | 1 | `specs/repositories_spec.js:148` |

Every one of these has a native equivalent. Verdict: **lodash is fully removable** from this codebase with low/medium effort.

---

## High-priority replacements (≥3 call sites)

### 1. `_.isEmpty` — 5 calls

**Native equivalents (per actual usage):**
- Strings (`routes.js:32`): `!sellerName || !sellerUrl || !sellerPwd` — falsy covers `undefined`, `null`, `''`.
- Plain object (`config.js:46`, `self.props` initialised to `{}`): `Object.keys(self.props).length === 0`.
- Maybe-undefined object (`seller.js:88`, `actualBill` can be `undefined`): `actualBill == null || Object.keys(actualBill).length === 0`.

**Edge cases**
- `_.isEmpty(null)` → `true`; `Object.keys(null)` **throws** — keep an explicit nullish check where the value can be `null`/`undefined`.
- `_.isEmpty(123)` → `true`; native `Object.keys(123).length === 0` → also `true`, but semantics drift. Not relevant here (all inputs are strings/objects).

**Effort:** ~15 min. **Behaviour:** identical for the values actually passed.

### 2. `_.size` — 4 calls (specs only)

```js
_.size(occurrences.FR)   →   occurrences.FR.length
```

All four call sites pass an array (output of `_.groupBy`). `Array.prototype.length` is identical.

**Edge cases:** `_.size` also works on objects/strings/Maps; not used that way here.

**Effort:** ~2 min.

### 3. `_.map` — 3 calls

| Site | Replacement |
|---|---|
| `repositories.js:13` — `_.map(sellersMap, s => s)` over an **object** | `Object.values(sellersMap)` |
| `routes.js:12` — `_.map(array, fn)` | `array.map(fn)` |
| `dispatcher.js:30` — `_.map(_.range(17), fn)` | `Array.from({ length: 17 }, (_, i) => fn(i))` |

**Edge cases**
- `_.map(obj, fn)` calls `fn(value, key, obj)`. `Object.values(obj).map(fn)` loses the key. If the key is needed: `Object.entries(obj).map(([k, v]) => …)`. The one object usage here ignores the key.

**Effort:** ~10 min.

### 4. `_.isNumber` — 3 calls

```js
_.isNumber(x)   →   typeof x === 'number'
```

**Edge cases**
- Both return `true` for `NaN` — identical. If `NaN` should be rejected, use `Number.isFinite(x)` (a behaviour upgrade, not a port).
- `_.isNumber(new Number(1))` → `true`; `typeof` → `'object'`. No `Number` objects in this code.

**Effort:** ~5 min.

### 5. `_.random` — 3 calls (all `services/order.js`)

```js
_.random(1, 10)         →   Math.floor(Math.random() * 10) + 1            // integer in [1,10]
_.random(1, 100, true)  →   Math.random() * 99 + 1                         // float in [1,100)
```

**Edge cases**
- `_.random(min, max)` returns an integer **inclusive** of both bounds. `Math.floor(Math.random()*(max-min+1))+min` matches.
- `_.random(min, max, true)` returns a float in `[min, max)` (upper exclusive) — `Math.random()*(max-min)+min` matches.
- Extract a tiny helper (`randInt`, `randFloat`) to avoid repeating the formula at all three sites.

**Effort:** ~10 min.

---

## Medium-priority replacements (2 call sites)

### 6. `_.reduce` (objects) — 2 calls (`repositories.js:208, 217`)

```js
_.reduce(europeanCountries, (acc, infos, country) => …, init)
// →
Object.entries(europeanCountries).reduce((acc, [country, infos]) => …, init)
```

**Edge cases**
- Lodash signature is `(acc, value, key)`; `Object.entries` gives `[key, value]` — **arguments order is reversed**, easy to get wrong.

**Effort:** ~15 min.

### 7. `_.sample` — 2 calls

```js
_.sample(arr)   →   arr[Math.floor(Math.random() * arr.length)]
```

**Edge cases:** empty array → both return `undefined`. Identical.

**Effort:** ~5 min.

### 8. `_.every` — 2 calls (specs)

```js
_.every(arr, Number)   →   arr.every(Number)
```

Identical for arrays.

**Effort:** ~2 min.

---

## Low-priority replacements (single call sites)

| Function | Replacement | Edge cases / Notes | Effort |
|---|---|---|---|
| `_.has(bill, 'total')` | `Object.hasOwn(bill, 'total')` (Node ≥16.9) | Lodash supports dotted paths like `'a.b.c'`; single-key here. | 2 min |
| `_.sortBy(sellers, s => -s.cash)` | `[...sellers].sort((a, b) => -a.cash - (-b.cash))` or simpler `[...sellers].sort((a, b) => b.cash - a.cash)` | Both stable (`Array.prototype.sort` stable since ES2019). Lodash returns new array; native `sort` mutates — copy first with spread. | 5 min |
| `_.fill(arr, v, start, end)` | `arr.fill(v, start, end)` | Identical behaviour and return value. | 2 min |
| `_.isString(x)` | `typeof x === 'string'` | Lodash also `true` for `new String('x')`; not used here. | 2 min |
| `_.isFunction(x)` | `typeof x === 'function'` | Identical for normal/async/arrow/generator functions. | 2 min |
| `_.shuffle(arr)` | Fisher–Yates helper (~5 lines) | **Bug spotted:** `repositories.js:215` calls `_.shuffle(countryDistributionByWeight)` and discards the return value — lodash `shuffle` does **not** mutate, so the call is a no-op today. Native port should either drop the line or implement an in-place shuffle. Flag before "porting" the bug forward. | 10 min |
| `_.result(obj, 'reduction')` + `_.find(...)` | `reductions.find(r => r.sum <= total)?.reduction` | `_.result` would *invoke* a function-valued property; `reduction` is a number here, so optional chaining is sufficient. | 5 min |
| `_.clone(order)` | `{ ...order }` | Shallow only — same as `_.clone`. `order` is a plain object. | 2 min |
| `_.range(17)` | `Array.from({ length: 17 }, (_, i) => i)` | Lodash supports `(start, end, step)`; only `_.range(n)` form used. | 2 min |
| `_.forEach(arr, fn)` | `arr.forEach(fn)` | Lodash also iterates objects; here it's an array. | 2 min |
| `_.times(n, fn)` (spec) | `Array.from({ length: n }, (_, i) => fn(i))` | Iteratee receives index in both. `n = 2,000,000` here; both are linear and comparable. | 2 min |
| `_.groupBy(arr)` (spec, identity grouping) | `arr.reduce((acc, v) => { (acc[v] ??= []).push(v); return acc }, {})` | `Object.groupBy` is ES2024 / Node ≥21. Reduce form works everywhere. | 5 min |

---

## Findings worth flagging before migration

1. **Dead `_.shuffle` call** at `repositories.js:215` — return value ignored, lodash doesn't mutate. Decide intent before porting (delete, or implement an in-place shuffle).
2. **`_.reduce` argument order trap** — lodash passes `(acc, value, key)`, `Object.entries` produces `[key, value]`. Easy regression vector at `repositories.js:208,217`.
3. **`actualBill` may be `undefined`** at `seller.js:88` (passed explicitly in `dispatcher.js:117`). Native `Object.keys(undefined)` throws — keep an explicit `== null` guard.
4. **`_.random` float mode** uses an exclusive upper bound; the integer form is inclusive on both ends. Don't unify them into one helper accidentally.

---

## Summary

- **Total call sites:** 37 across 9 files.
- **Distinct functions:** 21, **all replaceable** with native APIs (no third-party shim required).
- **Total estimated effort:** ~1.5–2 hours focused work to migrate everything, plus removing the `lodash` dependency from `demo/package.json`.
- **Risk:** Low. Highest-attention items are the `_.reduce` argument-order swap and the `actualBill` null-guard.

## Verification (when/if migration is later executed)

- `cd demo && npm test` (jasmine specs) — should pass unchanged.
- `cd demo && npm run lint` — should pass unchanged.
- Manual smoke: `npm start`, register a seller via `POST /seller`, hit `GET /sellers` and `GET /sellers/history`, watch a few shopping iterations in logs.

## Critical files (read-only for this analysis; would be edited in a migration)

- `demo/javascripts/config.js`
- `demo/javascripts/repositories.js`
- `demo/javascripts/routes.js`
- `demo/javascripts/services/order.js`
- `demo/javascripts/services/reduction.js`
- `demo/javascripts/services/seller.js`
- `demo/javascripts/services/dispatcher.js`
- `demo/specs/repositories_spec.js`
- `demo/specs/services_spec.js`
- `demo/package.json` (drop `lodash` dependency at the end)
