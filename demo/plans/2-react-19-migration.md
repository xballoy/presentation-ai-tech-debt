# React 0.12 → 19.2 Migration Plan

## Context

`demo/public` is a ~10-year-old frontend pinned to **React 0.12.2** loaded via Bower, with `JSXTransformer.js` running in the browser at every page load. The single component file `demo/public/javascripts/seller.js` still uses `React.createClass`, string refs with `getDOMNode()`, `componentWillReceiveProps`, jQuery AJAX, and Chart.js 1.x — every one of these APIs has been removed from modern React.

We need to bring this UI onto **React 19.2** while:
- Staying on plain JavaScript (no TypeScript), per the user's constraint.
- Keeping every library that ships in the bundle compatible with React 19.2.
- Producing an E2E test suite that runs against **both** the legacy and migrated apps so we can prove behavioral equivalence.

The Express backend (`demo/app.js`, `demo/javascripts/**`) is out of scope and untouched.

## Approach

Stand up a Vite + npm toolchain alongside the existing Bower assets, write the E2E suite against the **current** app first (route-mocked so it is deterministic), then rewrite the React tree as function components, then swap each peripheral library. Each phase is gated by re-running the same E2E suite — that's the only way to detect regressions caused by Bootstrap-5 class renames, Chart.js data-format changes, or react-intl currency formatting differences.

## Library compatibility matrix (React 19.2)

| Lib                | From   | To       | React 19 status                                                                   |
| ------------------ | ------ | -------- | --------------------------------------------------------------------------------- |
| react / react-dom  | 0.12.2 | 19.2.0   | target                                                                            |
| react-bootstrap    | 0.15.1 | 2.10.x   | peer deps allow React ≥16.14; works with 19 (verify with `npm view` before pinning) |
| react-intl         | 1.1.0  | 7.x      | supports React 16–19; **breaking**: requires `<IntlProvider locale="en">`         |
| chart.js           | 1.0.1  | 4.x      | not React-coupled                                                                 |
| react-chartjs-2    | (new)  | 5.x      | peer deps React 16.8–19                                                           |
| bootstrap (CSS)    | 3.3.2  | 5.3.x    | not React-coupled                                                                 |
| bootstrap-icons    | (new)  | 1.x      | replaces glyphicons                                                               |
| lodash             | 3.4.0  | 4.17.x   | not React-coupled                                                                 |
| jquery             | 2.1.3  | **drop** | use `fetch` + react-bootstrap `OverlayTrigger`                                    |
| html5shiv, respond | 3.7.2  | **drop** | IE8 polyfills no longer needed                                                    |
| bower              | -      | **drop** | replaced by npm                                                                   |

Action: before pinning, run `npm view react-bootstrap@2 peerDependencies` to confirm the React-19 range on the version we lock to (`npm view react-intl@7`, `npm view react-chartjs-2@5` similarly). Pin exact versions per global guideline.

## Migration phases

### Phase 0 — E2E baseline (write tests before touching React)
Critical: the tests must pass against the **current** 0.12 build so we have a reference.

- Add devDeps: `@playwright/test`.
- Create `demo/e2e/` with:
  - `e2e/fixtures/api.js` — mock fixtures for `/sellers`, `/sellers/history?chunk=10`, `POST /seller`. Shape must match `demo/javascripts/routes.js:10`, `:22`, `:27`.
  - `e2e/fixtures/mock.js` — Playwright fixture that calls `page.route('**/sellers', ...)`, `page.route('**/sellers/history*', ...)`, `page.route('**/seller', ...)` and returns canned JSON. Auto-applied to every test.
  - `e2e/seller.spec.js` — covers: form renders, ranking table renders, registering a seller adds it to the DOM, polling does not crash after 6 s, offline indicator shown for `online:false`, currency cell matches `/€\s?\d/` (loose — formatting differs between react-intl 1 and 7), chart `<canvas#salesChart>` is in the DOM.
  - `playwright.config.js` — `webServer: { command: 'npm start', url: 'http://localhost:3000', reuseExistingServer: true }`, projects for chromium + firefox + webkit.
- Run `npx playwright test` against the legacy build. Capture a screenshot baseline (`toHaveScreenshot`) but allow `maxDiffPixels: 200` because Bootstrap 5 will visually shift things.

Deliverable: a green E2E run on the unchanged codebase.

### Phase 1 — Vite + npm toolchain
- Create `demo/vite.config.js` with `@vitejs/plugin-react`, `root: 'public'`, `build.outDir: '../public/dist'`, and `server.proxy: { '/sellers': 'http://localhost:3000', '/seller': 'http://localhost:3000' }`.
- Add npm deps: `react`, `react-dom`, `react-bootstrap`, `react-intl`, `chart.js`, `react-chartjs-2`, `bootstrap`, `bootstrap-icons`. Add devDeps: `vite`, `@vitejs/plugin-react`, `eslint-plugin-react-hooks`.
- Update `demo/package.json` scripts: `"dev": "vite"`, `"build": "vite build"`, `"start": "node bin/www"`, and drop `postinstall: bower install`.
- Create `demo/public/src/main.jsx`, `demo/public/src/App.jsx`. `demo/public/index.html` becomes a Vite entry: drop all `<script src="./components/...">` tags, replace with `<script type="module" src="/src/main.jsx">`.
- `npm start` should now serve the Vite-built `public/dist`; `npm run dev` is the developer loop with HMR.
- Re-run Phase-0 tests against the Vite build (no React migration yet — just a JSX-compiled version of the same components, still using `react@19` but with the legacy class shapes ported minimally).

### Phase 2 — React core rewrite
Rewrite `demo/public/javascripts/seller.js` into three `.jsx` files under `demo/public/src/components/`:

- `SellerForm.jsx` — function component. State: three `useRef`s for name/password/url. On submit, read `nameRef.current.value`, validate, call `props.onSellerSubmit`, then clear inputs. Replaces `seller.js:3-47`.
- `SellerView.jsx` — function component. Uses `useMemo` to compute `chartData` from `props.salesHistory` (replaces `componentWillReceiveProps` at `seller.js:105-108` and `formatChartData` at `:68-99`). Renders `<Line>` from `react-chartjs-2` instead of imperative `chart.Line(...)`. Move `string2Color` to `src/utils/colorUtils.js`.
- `Seller.jsx` — function component. `useState` for `sellers` and `salesHistory`. `useEffect(() => { loadSellers(); getHistory(); const id = setInterval(..., 5000); return () => clearInterval(id); }, [])` replaces `componentDidMount` at `seller.js:228-231`. Both fetchers use `fetch()` instead of `$.ajax`. Replaces `seller.js:174-241`.
- `main.jsx` — `createRoot(document.getElementById('seller')).render(<IntlProvider locale="en"><Seller pollInterval={5000} historyFrequency={10} url="/seller" /></IntlProvider>)`. Replaces `seller.js:243-246`.

Hooks lint: enable `eslint-plugin-react-hooks` with the `recommended` config so the `setInterval` cleanup and dependency arrays are caught at lint time.

Re-run E2E.

### Phase 3 — Library swaps
- **react-intl 7**: `IntlProvider` must wrap the tree (already in `main.jsx`). `FormattedNumber` API still accepts `value`, `style`, `currency`. Loosen currency assertion in tests.
- **react-chartjs-2**: replace canvas + imperative chart with `<Line data={chartData} options={{ animation: false }} />`. Convert the dataset format (`fillColor` → `borderColor`, `strokeColor` → `borderColor`, `pointColor` → `pointBackgroundColor`, drop `bezierCurve`).
- **react-bootstrap 2.10**: replace the jQuery `$('[data-toggle="tooltip"]').tooltip()` at `seller.js:248-250` with `<OverlayTrigger placement="bottom" overlay={<Tooltip>...</Tooltip>}>` wrapping each input.
- **fetch**: already done in Phase 2.

### Phase 4 — Bootstrap 5 CSS
Class renames inside `demo/public/index.html` and the new `.jsx` components:
- `navbar-inverse navbar-fixed-top` → `navbar navbar-dark bg-dark fixed-top`
- `sr-only` → `visually-hidden`
- `glyphicon glyphicon-alert` → `<i class="bi bi-exclamation-triangle">` (bootstrap-icons)
- Drop `data-toggle`/`data-placement` (now handled by `OverlayTrigger`)
- Import `bootstrap/dist/css/bootstrap.min.css` and `bootstrap-icons/font/bootstrap-icons.css` from `src/main.jsx` instead of `<link>` tags.

Visual diff is expected. Re-baseline the Playwright screenshots in this phase, not earlier.

### Phase 5 — Cleanup
- Delete `demo/bower.json`, `demo/public/components/`, `bower` devDep.
- Delete the legacy `demo/public/javascripts/seller.js`, `demo/public/dist/` (old build output), and the IE8 conditional block in `index.html`.
- Update `demo/AGENTS.md` so the project-structure section reflects `src/` + Vite, and add `npm run dev` and `npm run build` to "Setup commands".

## Critical files

- `demo/public/javascripts/seller.js` — current React 0.12 component file, fully rewritten into `demo/public/src/components/*.jsx`.
- `demo/public/index.html` — entry point, becomes a Vite HTML entry.
- `demo/bower.json` — deleted.
- `demo/package.json` — adds frontend deps and Vite scripts.
- `demo/app.js` — untouched; `express.static(path.join(__dirname, 'public'))` already serves `public/dist`. Confirm Vite's `build.outDir` lands there.
- `demo/e2e/**` — new.
- `demo/playwright.config.js`, `demo/vite.config.js` — new.

## Verification

End-to-end gate after every phase:

```bash
cd demo
npm ci
npm run build          # Phase 1 onward
npm start &            # serves public/dist on :3000
npx playwright test    # must pass with the same spec file as Phase 0
kill %1
```

Specific checks:
1. **Behavior parity** — every assertion in `e2e/seller.spec.js` passes against both the legacy build (Phase 0) and the final build (Phase 5).
2. **No console errors** — Playwright `page.on('console', ...)` collector asserts zero errors during a full 6-second polling cycle.
3. **Cross-browser** — chromium + firefox + webkit projects in `playwright.config.js`.
4. **React 19 features verified** — `npm ls react react-dom` reports `19.2.0`; `console.log(React.version)` in the browser shows `19.2.0`.
5. **No legacy globals** — grep the built bundle for `React.createClass`, `getDOMNode`, `componentWillReceiveProps`, `$.ajax` → must be empty.
6. **Visual regression** — screenshot diff is intentionally re-baselined at Phase 4 (Bootstrap 5 shifts layout); Phase 5 must match Phase-4 baseline within `maxDiffPixels: 100`.

## Risks called out

- **react-bootstrap React-19 peer**: 2.10.x advertised React ≥16.14 but actual React-19 support landed in a recent patch. Verify with `npm view react-bootstrap@latest peerDependencies` before pinning; fall back to dropping react-bootstrap (questioned earlier) if the patch isn't out.
- **Currency string drift**: react-intl 7 emits `€1,500.50` (non-breaking space between symbol and number on some locales). Tests use a regex, not a literal match.
- **Chart.js color migration**: the dataset-shape change is the most error-prone step. Add one Playwright assertion that the canvas has non-zero pixel data after history loads.
- **Polling cleanup**: forgetting the `clearInterval` cleanup in `useEffect` leaks timers across hot reloads. `eslint-plugin-react-hooks` catches this.
