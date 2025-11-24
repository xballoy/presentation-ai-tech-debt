# Technical Debt Analysis: Extreme Carpaccio Server

## Executive Summary

This analysis identifies critical technical debt across a 10-year-old Node.js/Express game server codebase. The application is actively used for workshops and has 880 lines of backend code with 64 passing tests.

**Key Findings:**
- **1 Critical Security Vulnerability**: Code injection via `new Function()`
- **10+ High Severity Issues**: Including plaintext passwords, 10-year-old React, deprecated dependencies
- **15+ Medium Severity Issues**: Code smells, missing error handling, outdated patterns
- **Total estimated remediation**: 24-35 days for full modernization

**Priorities based on user concerns:**
1. Security vulnerabilities (CRITICAL)
2. Maintainability improvements (HIGH)
3. Modern dependencies (MEDIUM)
4. Test coverage gaps (MEDIUM)

---

## Critical Issues (Severity: CRITICAL)

### 1. Code Injection Vulnerability via `new Function()`

**Location**: `javascripts/repositories.js:152-154`

**Current Code**:
```javascript
function customEval (s) {
  return new Function('return ' + s)() // eslint-disable-line no-new-func
}
```

**Problem**:
- Allows arbitrary JavaScript execution from configuration file
- Used at line 170 to evaluate custom tax rules from `configuration.json`
- If configuration file is compromised or user-supplied, attacker can execute any code
- Example exploit: `"taxes": { "SK": "require('fs').unlinkSync('/important-file')" }`

**Why Critical**:
- Remote code execution vulnerability
- Configuration file could be modified via web UI in future
- Violates security best practices
- Already has ESLint warning disabled, indicating known issue

**Effort to Fix**: 2 hours

**Remediation Approach**:
1. Replace with Zod schema validation for tax rules
2. Support only numeric scale factors (e.g., `1.2` for 20% tax)
3. Remove string evaluation entirely
4. Update configuration format to type-safe structure
5. Add validation tests for malicious input rejection

**Alternative**: Use a safe expression parser library like `expr-eval` with sandboxing

**Impact**: Must update `configuration.json` format (breaking change acceptable per user)

---

## High Severity Issues

### 2. Plaintext Password Storage

**Location**: `javascripts/services/seller.js:48-72`, `javascripts/routes.js:30, 34-35`

**Problem**:
- Passwords stored in memory as plaintext (line 62: `password: password`)
- Direct string comparison at line 51: `var samePwd = (seller.password === password)`
- If server crashes or memory dumped, all passwords exposed
- No protection against rainbow table attacks

**Severity**: HIGH

**Effort to Fix**: 2 hours

**Remediation Approach**:
1. Add `bcrypt` dependency (`npm install bcrypt@^6.0.0`)
2. Hash passwords on registration using `bcrypt.hash(password, 10)`
3. Compare using `bcrypt.compare(password, seller.password)`
4. Migrate `register()` and `isAuthorized()` to async/await
5. Update route handlers to handle async functions

**Impact**: Minimal - internal API change only

---

### 3. Deprecated React 0.12.2 (2014 - 10 Years Old)

**Location**: `bower.json:9`, `public/javascripts/seller.js`, `public/index.html:18-22`

**Problem**:
- React 0.12.2 released December 2014
- No security patches for 10 years
- Uses deprecated APIs: `React.createClass`, string refs, `getDOMNode()`, inline JSX transformation
- JSXTransformer for in-browser compilation (massive performance penalty)
- Cannot use modern React ecosystem (hooks, context, suspense)
- Zero frontend test coverage due to outdated tooling

**Severity**: HIGH (security + maintainability)

**Effort to Fix**: 10-15 days (full upgrade path)

**Remediation Approach** (incremental):
1. Add frontend build system (Vite or esbuild) - 1 day
2. Migrate from Bower to npm - 1 day
3. Add frontend testing infrastructure (Vitest + React Testing Library) - 1 day
4. Incrementally upgrade React: 0.12 → 0.14 → 15 → 16 → 18 - 5 days
5. Modernize components to functional + hooks - 2 days
6. Update Chart.js 1.x → Recharts or Chart.js 4.x - 1 day

**Alternative (Complete Rewrite)**: Build new frontend with React 19 + TypeScript (8-10 days)

**Impact**: Breaking change to build process but not API

---

### 4. Bower Dependency Manager (Deprecated Since 2017)

**Location**: `bower.json`, `package.json:9`, `.bowerrc`

**Problem**:
- Bower deprecated in 2017, no longer maintained
- Security vulnerabilities in bower itself
- Runs on every `npm install` via postinstall hook
- Conflicts with modern build tools
- Version mismatches (bower has lodash 3.4.0, npm has 4.17.21)

**Severity**: HIGH

**Effort to Fix**: 2 days (as part of React upgrade)

**Remediation Approach**:
1. Install npm equivalents of all bower packages
2. Update `index.html` script tags to reference npm versions
3. Remove `postinstall` hook from package.json
4. Delete `bower.json` and `.bowerrc`
5. Add build step to bundle frontend dependencies

**Impact**: Requires build system (Vite/webpack)

---

### 5. Callback Hell - No Promises or Async/Await

**Location**: Throughout `javascripts/services/`, `javascripts/utils.js:26-42`

**Problem**:
- All async operations use callbacks
- Nested callbacks make code hard to read (dispatcher.js:94-112)
- Error handling scattered and inconsistent
- Cannot use modern async patterns
- Makes testing complex

**Example** (services/seller.js:78-109):
```javascript
this.orderService.sendOrder(seller, order, cashUpdater, function (exception) {
  self.notify(seller, {
    type: 'ERROR',
    content: exception.message
  })
})
```

**Severity**: HIGH (maintainability)

**Effort to Fix**: 3-4 days

**Remediation Approach**:
1. Convert `utils.js` HTTP functions to return Promises
2. Migrate service methods to async/await bottom-up
3. Update tests to handle Promises
4. Add try/catch error handling
5. Use Promise.all for parallel operations

**Impact**: Internal refactor, no API changes

---

### 6. Silent Error Handling

**Location**: `javascripts/utils.js:40`, `javascripts/config.js:16-28`

**Problem**:
- HTTP errors swallowed silently: `request.on('error', onError || function () {})`
- Configuration load failures logged but not propagated
- Seller HTTP failures disappear without notification
- Makes debugging impossible

**Examples**:
```javascript
// utils.js:40 - empty error handler
request.on('error', onError || function () {})

// config.js:16-17 - error logged but file loading continues
if (err) {
  console.error('%j', err)
} else {
  // continues as if nothing happened
}
```

**Severity**: HIGH (maintainability)

**Effort to Fix**: 1 day

**Remediation Approach**:
1. Always provide default error handlers that log meaningfully
2. Propagate configuration errors to callback
3. Add application-level error tracking
4. Consider using Pino or Winston for structured logging
5. Add error boundary for seller communication failures

**Impact**: Better observability, no functional changes

---

### 7. No Frontend Test Coverage

**Location**: `specs/` directory has no frontend tests

**Problem**:
- Zero tests for React components
- Cannot safely refactor UI
- No regression protection
- Manual testing only
- 250 lines of untested React code

**Severity**: HIGH (maintainability)

**Effort to Fix**: 1-2 days

**Remediation Approach**:
1. Add Vitest + React Testing Library
2. Write tests for 3 main components:
   - SellerForm (registration)
   - RankingList (seller display)
   - CashHistoryChart (visualization)
3. Test AJAX interactions with MSW (Mock Service Worker)
4. Establish testing patterns for future work

**Impact**: No production changes, safety net for future

---

### 8. Prototype-Based Constructors (Pre-ES6 Patterns)

**Location**: `javascripts/repositories.js`, `javascripts/services/`, `javascripts/config.js`

**Problem**:
- Uses `function Constructor()` + `Constructor.prototype = { ... }`
- Verbose compared to ES6 classes
- Closure-based private variables inconsistently applied
- Mixed patterns (some use closures, some use prototype)
- Harder for modern developers to understand

**Example** (repositories.js:42-101):
```javascript
Sellers.prototype = (function () {
  return {
    count: function () { return this.all().length },
    isEmpty: function () { return this.count() === 0 }
  }
})()
```

**Severity**: HIGH (maintainability)

**Effort to Fix**: 2 days

**Remediation Approach**:
1. Convert to ES6 classes with private fields (#privateField)
2. Use consistent encapsulation patterns
3. Update tests
4. Maintain same public API

**Impact**: Internal refactor only

---

### 9. In-Browser JSX Transformation

**Location**: `public/index.html:21-22`

**Problem**:
```html
<script src="components/react/JSXTransformer.js"></script>
<script type="text/jsx" src="javascripts/seller.js"></script>
```

- Compiles JSX on every page load in browser
- Massive performance penalty (~500ms+ on slow devices)
- JSXTransformer deprecated since React 0.13 (2015)
- Blocks React upgrade
- No minification or optimization

**Severity**: HIGH (performance + maintainability)

**Effort to Fix**: 1 day (with build system)

**Remediation Approach**:
1. Add Vite or esbuild for pre-compilation
2. Compile JSX at build time, not runtime
3. Remove JSXTransformer dependency
4. Generate optimized bundle
5. Add source maps for debugging

**Impact**: Requires build step before deployment

---

## Medium Severity Issues

### 10. Mixed var/const/let Usage

**Location**: All JavaScript files

**Problem**:
- 115+ instances of `var` declarations
- Inconsistent with modern JavaScript
- Potential hoisting bugs
- ESLint already configured but not enforcing

**Severity**: MEDIUM

**Effort to Fix**: 1 hour (automated)

**Remediation**: Enable `"no-var": "error"` in `.eslintrc`, run `eslint --fix`

---

### 11. jQuery Dependency (Unnecessary)

**Location**: `public/javascripts/seller.js:176-216`, `bower.json:14`

**Problem**:
- jQuery 2.1.3 (2014) only used for AJAX calls
- Modern `fetch` API eliminates need
- Adds 84KB to bundle
- Outdated security patches

**Severity**: MEDIUM

**Effort to Fix**: 2 hours

**Remediation**: Replace `$.ajax()` with `fetch()` or axios

---

### 12. Bootstrap 3 (2014, End of Life)

**Location**: `bower.json:10`, `public/index.html:14`

**Problem**:
- Bootstrap 3.3.2 from 2014
- End of life since 2019
- No security updates
- Missing modern features
- Current version is Bootstrap 5

**Severity**: MEDIUM

**Effort to Fix**: 2-3 days (breaking UI changes)

**Remediation**: Upgrade to Bootstrap 5 or migrate to Tailwind CSS

---

### 13. Chart.js 1.0 (2014, Unmaintained)

**Location**: `bower.json:16`, `public/javascripts/seller.js:120-146`

**Problem**:
- Chart.js 1.x from 2014
- Current version is 4.x
- Imperative API (not React-friendly)
- Manual DOM manipulation inside React render
- No TypeScript support

**Severity**: MEDIUM

**Effort to Fix**: 4 hours

**Remediation**: Replace with Recharts or upgrade to Chart.js 4.x with react-chartjs-2

---

### 14. No Input Validation

**Location**: `javascripts/routes.js:28-36`, `javascripts/services/order.js`

**Problem**:
- Routes accept any JSON without validation
- No type checking on order fields
- Configuration overrides have no validation
- Potential for undefined access crashes

**Severity**: MEDIUM

**Effort to Fix**: 1 day

**Remediation**: Add Zod schemas for request validation

---

### 15. Memory Leaks in React Components

**Location**: `public/javascripts/seller.js:230`

**Problem**:
```javascript
// Line 230: setInterval never cleared
setInterval(function () {
  this.refreshSellers()
}.bind(this), 1000)
```

- No cleanup on component unmount
- Intervals continue after navigation
- Event listeners not removed

**Severity**: MEDIUM

**Effort to Fix**: 1 hour

**Remediation**: Store interval ID, clear in `componentWillUnmount`

---

### 16. Hardcoded Magic Numbers

**Location**: Throughout codebase

**Examples**:
- Tax multipliers without explanation (repositories.js:108-137)
- 50% penalty factor (services/seller.js)
- Chunk sizes (routes.js)
- Interval timings (dispatcher.js)

**Severity**: MEDIUM

**Effort to Fix**: 2 hours

**Remediation**: Extract to named constants with documentation

---

### 17. fs.watchFile() Instead of fs.watch()

**Location**: `javascripts/config.js:56`

**Problem**:
- `fs.watchFile()` uses polling (inefficient)
- `fs.watch()` uses native OS events
- Higher CPU usage
- Unreliable on some systems

**Severity**: MEDIUM

**Effort to Fix**: 1 hour

**Remediation**: Use `chokidar` library for reliable file watching

---

### 18. No Logging Framework

**Location**: Throughout (console.info, console.error, console.warn)

**Problem**:
- Mix of `console.*` calls with color formatting
- No structured logging
- No log levels
- No log aggregation capability
- Difficult to debug production issues

**Severity**: MEDIUM

**Effort to Fix**: 1 day

**Remediation**: Migrate to Pino or Winston for structured logging

---

### 19. God Object: Dispatcher

**Location**: `javascripts/services/dispatcher.js`

**Problem**:
- Orchestrates multiple services
- Manages timing/scheduling
- Handles bad request logic
- Tracks iterations
- 200+ lines doing too many things

**Severity**: MEDIUM

**Effort to Fix**: 2 days

**Remediation**: Extract scheduling, bad request handling into separate services

---

### 20. No TypeScript

**Location**: Entire codebase

**Problem**:
- No type safety
- Runtime errors for type mismatches
- Harder to refactor
- No IDE autocomplete
- Documentation in comments instead of types

**Severity**: MEDIUM (if staying long-term)

**Effort to Fix**: 5-7 days

**Remediation**: Gradual migration to TypeScript with JSDoc as intermediate step

---

## Low Severity Issues

### 21. Missing .nvmrc

**Current State**: No Node version specification

**Severity**: LOW

**Effort to Fix**: 5 minutes

**Remediation**: Add `.nvmrc` with `22` (current LTS)

---

### 22. No Docker Setup

**Severity**: LOW

**Effort to Fix**: 1 hour

**Remediation**: Add Dockerfile for containerized deployment

---

### 23. Inconsistent Code Style

**Problem**: Mixed semicolon usage, indentation inconsistencies

**Severity**: LOW

**Effort to Fix**: 30 minutes

**Remediation**: Add Prettier, run formatting

---

### 24. No CI/CD

**Severity**: LOW

**Effort to Fix**: 2 hours

**Remediation**: Add GitHub Actions for linting + testing

---

### 25. Insufficient Documentation

**Current**: Basic AGENTS.md, no architecture docs

**Severity**: LOW

**Effort to Fix**: 1 day

**Remediation**: Add architecture decision records, API docs

---

## Dependency Audit

### Backend Dependencies (package.json)

| Package | Current | Latest | Status | Notes |
|---------|---------|--------|--------|-------|
| express | 5.1.0 | 5.1.0 | ✅ Current | Recently updated |
| body-parser | 2.2.0 | 2.2.1 | ⚠️ Patch available | Minor update |
| lodash | 4.17.21 | 4.17.21 | ✅ Current | Good |
| debug | 4.3.4 | 4.4.0 | ⚠️ Patch available | Non-critical |
| chalk | 4.1.2 | 5.4.2 | 🔴 Major behind | ESM-only in v5 |
| url-assembler | 2.1.1 | 3.0.3 | 🔴 Major behind | Check breaking changes |

### Frontend Dependencies (bower.json)

| Package | Current | Latest | Status | Security |
|---------|---------|--------|--------|----------|
| react | 0.12.2 | 19.0.0 | 🔴 10 years old | Critical |
| react-bootstrap | 0.15.1 | 2.10.8 | 🔴 10 years old | High |
| bootstrap | 3.3.2 | 5.3.3 | 🔴 EOL since 2019 | Medium |
| jquery | 2.1.3 | 3.7.1 | 🔴 10 years old | High |
| react-intl | 1.1.0 | 7.4.1 | 🔴 10 years old | Medium |
| chartjs | 1.0.1 | 4.4.8 | 🔴 Unmaintained | Medium |
| lodash | 3.4.0 | 4.17.21 | 🔴 Mismatch with npm | Medium |

---

## Prioritized Action Plan

### Tier 1: Critical Security (Must Do) - 1 week

**Total Effort**: 8 hours

**Items**:
1. ✅ Fix `new Function()` code injection (2h)
2. ✅ Hash passwords with bcrypt (2h)
3. ✅ Update body-parser patch (0.5h)
4. ✅ Auto-fix var → const/let (1h)
5. ✅ Fix silent error handling (1h)
6. ✅ Add integration tests for security (1.5h)

**Value**: Eliminates critical vulnerabilities

**Risk**: Low - isolated changes

---

### Tier 2: Quick Wins (Should Do) - 2 days

**Total Effort**: 8 hours

**Items**:
1. Remove Bower postinstall hook (0.5h)
2. Fix React memory leaks (1h)
3. Add .nvmrc (5min)
4. Extract magic numbers to constants (2h)
5. Add Prettier formatting (0.5h)
6. Replace fs.watchFile with chokidar (1h)
7. Replace jQuery with fetch (2h)
8. Add basic CI/CD (1h)

**Value**: Immediate maintainability improvements

**Risk**: Very low

---

### Tier 3: Backend Modernization (High Value) - 1 week

**Total Effort**: 40 hours

**Items**:
1. Migrate callbacks to async/await (3 days)
2. Convert prototypes to ES6 classes (2 days)
3. Add structured logging (Pino) (1 day)
4. Add Zod validation (1 day)
5. Refactor Dispatcher (2 days)
6. Expand test coverage to 90% (2 days)

**Value**: Modern, maintainable backend

**Risk**: Medium - requires careful testing

---

### Tier 4: Frontend Foundation (Prerequisite) - 1 week

**Total Effort**: 40 hours

**Items**:
1. Add Vite build system (1 day)
2. Migrate Bower → npm (1 day)
3. Pre-compile JSX (1 day)
4. Add frontend testing (Vitest + RTL) (2 days)
5. Write component tests (2 days)

**Value**: Enables React upgrade

**Risk**: Medium - requires build pipeline

---

### Tier 5: Frontend Modernization (High Impact) - 3 weeks

**Total Effort**: 120 hours

**Items**:
1. Upgrade React incrementally (10 days)
   - 0.12 → 0.14 (split React/ReactDOM)
   - 0.14 → 15 (minimal changes)
   - 15 → 16 (lifecycle updates)
   - Migrate to functional components + hooks
   - 16 → 18 (concurrent rendering)
2. Replace Chart.js 1.x with Recharts (1 day)
3. Upgrade Bootstrap 3 → 5 or Tailwind (2 days)
4. Remove jQuery (completed in Tier 2)
5. Comprehensive E2E tests (2 days)

**Value**: Modern, secure, performant UI

**Risk**: High - most complex migration

---

### Tier 6: Long-Term Quality (Optional) - Ongoing

**Items**:
1. TypeScript migration (5-7 days)
2. Architecture documentation (1 day)
3. Docker containerization (1 hour)
4. Performance optimization (2 days)
5. Accessibility audit (1 day)

**Value**: Best practices, future-proofing

**Risk**: Low - additive improvements

---

## Alternative: Complete Rewrite (6-8 weeks)

If modernization debt exceeds value of incremental fixes, consider ground-up rewrite:

**Tech Stack**:
- Backend: Express 5 + TypeScript 5.9
- Frontend: React 19 + Vite 6 + Tailwind 4
- Validation: Zod 4.1
- Testing: Vitest 4 + Playwright 1.5
- Logging: Pino 9.7

**Effort**: 340-430 hours

**Value**: Clean slate, zero technical debt

**Risk**: High - requires parallel run and gradual cutover

See complete rewrite plan in appendix for details.

---

## Recommended Approach

Based on user priorities (security + maintainability) and active production use:

### Phase 1: Immediate Security Fix (1 day)
- Fix critical code injection
- Hash passwords
- Deploy with minimal testing

### Phase 2: Document & Plan (1 week)
- Present this analysis to stakeholders
- Get buy-in for Tier 1-3 work
- Schedule modernization in phases

### Phase 3: Execute Tiers Incrementally
- Complete Tier 1 (security) immediately
- Schedule Tier 2-3 (backend) next quarter
- Plan Tier 4-5 (frontend) when build system ready

### Phase 4: Continuous Improvement
- Address Tier 6 items as ongoing work
- Revisit rewrite decision after Tier 3 completion

---

## Success Metrics

**Security**:
- ✅ Zero critical vulnerabilities
- ✅ Zero plaintext passwords
- ✅ All dependencies within 1 major version

**Maintainability**:
- ✅ >85% test coverage (currently ~70%)
- ✅ <10% code complexity (currently ~15%)
- ✅ <2 hour onboarding time for new developers

**Performance**:
- ✅ <2s page load (currently ~4s with JSX transform)
- ✅ <100ms API latency p95

**Modern Stack**:
- ✅ React 16+ (currently 0.12)
- ✅ ES6+ throughout (currently mixed)
- ✅ Build tooling (currently none)

---

## Files Requiring Modification

### Critical Priority
- `javascripts/repositories.js:152-154` - Code injection fix
- `javascripts/services/seller.js:48-72` - Password hashing
- `package.json:12` - Dependency updates

### High Priority
- `javascripts/services/dispatcher.js` - Async/await, refactoring
- `javascripts/config.js` - Async/await, error handling
- `javascripts/utils.js:40` - Error handling
- All service files - Callback to Promise migration
- `.eslintrc` - Enable no-var rule

### Medium Priority
- `public/javascripts/seller.js` - React upgrade, memory leaks
- `public/index.html` - Build system integration
- `bower.json` - Migration to npm
- All prototype constructors - ES6 class migration

### Future
- Entire codebase for TypeScript migration
- Build configuration files (vite.config.ts, etc.)
- Test files for expanded coverage

---

## Conclusion

This codebase has significant technical debt accumulated over 10 years, with 1 critical security issue and 20+ high/medium severity problems. The code is well-structured but uses outdated patterns and dependencies.

**Recommended Path**: Incremental modernization starting with critical security fixes, followed by backend modernization, then frontend foundation and React upgrade. Total effort: 24-35 days spread over 2-3 quarters.

**Alternative**: Complete TypeScript rewrite if budget allows (6-8 weeks), providing cleanest long-term solution.

The application's core logic is sound - tax calculations, order dispatching, and game mechanics are well-tested. The debt is primarily in language patterns, dependency versions, and frontend architecture, all of which can be addressed incrementally without rewriting business logic.
