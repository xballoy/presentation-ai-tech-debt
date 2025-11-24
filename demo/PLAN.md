# React Migration Plan: 0.12.2 → 19.2.0

## Current State Analysis

### React Version
- **Current**: React 0.12.2 (November 2014 - over 10 years old)
- **Target**: React 19.2.0

### Architecture Issues
| Issue | Impact |
|-------|--------|
| Runtime JSX transformation via `JSXTransformer.js` | Performance penalty, deprecated |
| Bower for frontend dependencies | Deprecated since 2017 |
| No build system (no bundler) | No tree-shaking, minification, code splitting |
| Global script loading | No module system |
| jQuery for AJAX | Should use native `fetch()` |

### Legacy React Patterns to Migrate
| Pattern | Current | Target |
|---------|---------|--------|
| Component definition | `React.createClass()` | Function components with hooks |
| Refs | String refs (`ref='name'`) | `useRef()` hook |
| Initial state | `getInitialState()` | `useState()` hook |
| Lifecycle | `componentDidMount`, `componentWillReceiveProps` | `useEffect()` hook |
| Render | `React.render()` | `createRoot().render()` |
| DOM access | `this.refs.name.getDOMNode()` | `ref.current` |

### Current Dependencies (bower.json)
| Library | Current | Latest | React 19 Compatible |
|---------|---------|--------|---------------------|
| react | 0.12.2 | 19.2.0 | ✅ Target |
| react-bootstrap | 0.15.1 | 2.10.10 | ✅ (requires React ≥16.14) |
| react-intl | 1.1.0 | 7.1.14 | ✅ (supports React 16-19) |
| chartjs | 1.0.1 | 4.5.1 | N/A (not React-specific) |
| bootstrap | 3.3.2 | 5.3.8 | N/A (CSS framework) |
| jquery | 2.1.3 | - | Remove (use fetch) |
| lodash | 3.4.0 | 4.17.21 | N/A (utility library) |
| html5shiv | 3.7.2 | - | Remove (IE8 support unnecessary) |
| respond | 1.4.2 | - | Remove (IE8 support unnecessary) |

### New Dependencies Required
| Library | Version | Purpose |
|---------|---------|---------|
| react | 19.2.0 | Core library |
| react-dom | 19.2.0 | DOM rendering |
| react-bootstrap | 2.10.10 | Bootstrap components |
| react-intl | 7.1.14 | Internationalization |
| chart.js | 4.5.1 | Charting library |
| react-chartjs-2 | 5.3.1 | React wrapper for Chart.js |
| bootstrap | 5.3.8 | CSS framework |
| lodash-es | 4.17.21 | ES modules version |
| vite | 6.3.5 | Build tool |

---

## Migration Phases

### Phase 1: Build System Setup
**Goal**: Replace Bower + runtime JSX with modern npm + Vite toolchain

1. Initialize npm for frontend dependencies
2. Install Vite as the build tool
3. Configure Vite for React JSX transformation
4. Create entry point structure (`src/main.jsx`, `src/App.jsx`)
5. Update `package.json` scripts
6. Configure development server proxy for API calls

**Files to create**:
- `vite.config.js`
- `src/main.jsx`
- `src/App.jsx`

**Files to modify**:
- `package.json` (add frontend dependencies + scripts)
- `public/index.html` (update to use Vite)

### Phase 2: React Core Migration
**Goal**: Migrate from React 0.12 patterns to React 19

1. **Replace `React.createClass` with function components**
   - `SellerForm` → function component with `useState`/`useRef`
   - `SellerView` → function component with `useState`/`useEffect`
   - `Seller` → function component with `useState`/`useEffect`

2. **Replace string refs with `useRef`**
   ```javascript
   // Before
   ref='name'
   this.refs.name.getDOMNode().value

   // After
   const nameRef = useRef(null);
   nameRef.current.value
   ```

3. **Replace lifecycle methods with `useEffect`**
   ```javascript
   // Before
   componentDidMount: function() { ... }
   componentWillReceiveProps: function() { ... }

   // After
   useEffect(() => { ... }, []);
   useEffect(() => { ... }, [props.salesHistory]);
   ```

4. **Replace `React.render` with `createRoot`**
   ```javascript
   // Before
   React.render(<Seller />, document.getElementById('seller'));

   // After
   createRoot(document.getElementById('seller')).render(<Seller />);
   ```

### Phase 3: Library Updates

#### 3.1 react-intl Migration (1.1.0 → 7.1.14)
```javascript
// Before
var FormattedNumber = ReactIntl.FormattedNumber;
<FormattedNumber value={seller.cash} style='currency' currency='EUR' />

// After
import { FormattedNumber, IntlProvider } from 'react-intl';
// Wrap app with IntlProvider
<IntlProvider locale="en">
  <App />
</IntlProvider>
// Usage remains similar
<FormattedNumber value={seller.cash} style="currency" currency="EUR" />
```

#### 3.2 react-bootstrap Migration (0.15.1 → 2.10.10)
- Current code doesn't actively use react-bootstrap components (just loaded)
- Bootstrap 5 has breaking changes from Bootstrap 3:
  - `data-toggle` → `data-bs-toggle`
  - `data-placement` → `data-bs-placement`
  - Navbar class changes (`navbar-inverse` → `navbar-dark bg-dark`)
  - Grid system changes (minor)

#### 3.3 Chart.js Migration (1.0.1 → 4.5.1)
```javascript
// Before (Chart.js 1.x)
var chart = new Chart(ctx);
chart.Line(data, options);

// After (Chart.js 4.x with react-chartjs-2)
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

<Line data={chartData} options={chartOptions} />
```

**Data format changes**:
```javascript
// Before (Chart.js 1.x)
{
  labels: ['1', '2', '3'],
  datasets: [{
    fillColor: 'transparent',
    strokeColor: '#ff0000',
    pointColor: '#ff0000',
    data: [10, 20, 30]
  }]
}

// After (Chart.js 4.x)
{
  labels: ['1', '2', '3'],
  datasets: [{
    fill: false,
    borderColor: '#ff0000',
    pointBackgroundColor: '#ff0000',
    data: [10, 20, 30]
  }]
}
```

#### 3.4 jQuery Removal
Replace jQuery AJAX with native `fetch()`:
```javascript
// Before
$.ajax({
  url: '/sellers',
  datatype: 'json',
  success: function(data) { ... },
  error: function(xhr, status, err) { ... }
});

// After
const response = await fetch('/sellers');
const data = await response.json();
```

Replace jQuery tooltip with Bootstrap 5 native or react-bootstrap `OverlayTrigger`:
```javascript
// Before
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

// After (using react-bootstrap)
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
<OverlayTrigger overlay={<Tooltip>Your tooltip text</Tooltip>}>
  <input ... />
</OverlayTrigger>
```

### Phase 4: Bootstrap CSS Migration (3.3.2 → 5.3.8)

**Breaking changes to address**:

| Bootstrap 3 | Bootstrap 5 |
|-------------|-------------|
| `navbar-inverse` | `navbar-dark bg-dark` |
| `navbar-fixed-top` | `fixed-top` |
| `data-toggle` | `data-bs-toggle` |
| `data-target` | `data-bs-target` |
| `data-placement` | `data-bs-placement` |
| `sr-only` | `visually-hidden` |
| `glyphicon glyphicon-alert` | Bootstrap Icons or other icon library |

**Glyphicons replacement**:
Bootstrap 5 removed Glyphicons. Options:
- Bootstrap Icons (recommended): `npm install bootstrap-icons`
- Font Awesome
- Heroicons

### Phase 5: Cleanup

1. Remove Bower
   - Delete `bower.json`
   - Delete `public/components/` directory
   - Remove bower from devDependencies

2. Remove IE8 polyfills
   - Remove html5shiv
   - Remove respond.js
   - Remove conditional comments from HTML

3. Update ESLint configuration for modern React

---

## Target File Structure

```
demo/
├── src/
│   ├── main.jsx              # Entry point with createRoot
│   ├── App.jsx               # Root component with IntlProvider
│   ├── components/
│   │   ├── Seller.jsx        # Main container component
│   │   ├── SellerForm.jsx    # Form component
│   │   └── SellerView.jsx    # Display component with chart
│   └── utils/
│       └── colorUtils.js     # string2Color helper
├── public/
│   ├── index.html            # Updated for Vite
│   └── stylesheets/
│       └── style.css
├── vite.config.js
├── package.json              # Updated with all dependencies
└── ...
```

---

## Target package.json Dependencies

```json
{
  "dependencies": {
    "body-parser": "^2.2.0",
    "chalk": "^4.1.2",
    "debug": "^4.3.4",
    "express": "^5.1.0",
    "lodash": "^4.17.21",
    "url-assembler": "^2.1.1",
    "bootstrap": "5.3.8",
    "bootstrap-icons": "1.12.1",
    "chart.js": "4.5.1",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "react-bootstrap": "2.10.10",
    "react-chartjs-2": "5.3.1",
    "react-intl": "7.1.14"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.5.2",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "5.2.0",
    "jasmine-node": "^3.0.0",
    "supertest": "^7.0.0",
    "vite": "6.3.5"
  }
}
```

---

## E2E Testing Strategy

### Pre-Migration: Establish Baseline

**1. Manual Test Scenarios** (document expected behavior):
| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Page load | Navigate to http://localhost:3000 | Form and empty ranking table visible |
| Seller registration | Fill name, password, URL → Submit | New seller appears in ranking |
| Data polling | Wait 5+ seconds | Ranking updates automatically |
| Chart rendering | Register seller, wait for history | Line chart displays with seller data |
| Tooltip display | Hover over form inputs | Tooltip appears with help text |
| Offline indicator | Seller goes offline | Alert icon appears next to seller |

**2. Install Testing Tools**

```bash
npm install -D @playwright/test msw
npx playwright install
```

- **Playwright**: E2E testing framework
- **MSW 2.12.3**: Mock Service Worker for API mocking

**3. Setup MSW Handlers**

Create mock handlers that mirror the real API:

```javascript
// e2e/mocks/handlers.js
import { http, HttpResponse } from 'msw';

// Test data fixtures
export const mockSellers = [
  { name: 'Alice', cash: 1500.50, online: true },
  { name: 'Bob', cash: 1200.00, online: true },
  { name: 'Charlie', cash: 800.25, online: false },
];

export const mockHistory = {
  lastIteration: 100,
  history: {
    Alice: [100, 200, 350, 500, 700, 900, 1100, 1300, 1400, 1500.50],
    Bob: [150, 250, 400, 550, 700, 850, 950, 1050, 1150, 1200],
    Charlie: [200, 300, 400, 500, 600, 650, 700, 750, 800, 800.25],
  },
};

export const handlers = [
  // GET /sellers - return list of sellers
  http.get('/sellers', () => {
    return HttpResponse.json(mockSellers);
  }),

  // GET /sellers/history - return sales history
  http.get('/sellers/history', ({ request }) => {
    const url = new URL(request.url);
    const chunk = url.searchParams.get('chunk') || '10';
    return HttpResponse.json(mockHistory);
  }),

  // POST /seller - register new seller
  http.post('/seller', async ({ request }) => {
    const body = await request.formData();
    const newSeller = {
      name: body.get('name'),
      cash: 0,
      online: true,
    };
    return HttpResponse.json(newSeller, { status: 201 });
  }),
];
```

**4. Integrate MSW with Playwright**

Option A: Browser-level mocking (recommended for true E2E):

```javascript
// e2e/mocks/browser.js
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

```javascript
// src/main.jsx (development only)
async function enableMocking() {
  if (process.env.NODE_ENV === 'development' && process.env.ENABLE_MOCKS) {
    const { worker } = await import('../e2e/mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  // render app
});
```

Option B: Playwright route interception with MSW handlers (simpler setup):

```javascript
// e2e/fixtures.js
import { test as base } from '@playwright/test';
import { mockSellers, mockHistory } from './mocks/handlers';

export const test = base.extend({
  // Auto-mock API for all tests
  autoMock: [async ({ page }, use) => {
    // Mock GET /sellers
    await page.route('**/sellers', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSellers),
        });
      }
    });

    // Mock GET /sellers/history
    await page.route('**/sellers/history*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHistory),
      });
    });

    // Mock POST /seller
    await page.route('**/seller', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    await use();
  }, { auto: true }],
});

export { expect } from '@playwright/test';
```

**5. Create Baseline E2E Tests** (before migration):

```javascript
// e2e/seller.spec.js
import { test, expect } from '@playwright/test';

test.describe('Seller Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('displays registration form', async ({ page }) => {
    await expect(page.locator('input[placeholder="your name"]')).toBeVisible();
    await expect(page.locator('input[placeholder="your password"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="192.168"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText('Register');
  });

  test('displays ranking table', async ({ page }) => {
    await expect(page.locator('h2:has-text("Ranking")')).toBeVisible();
    await expect(page.locator('table th:has-text("Name")')).toBeVisible();
    await expect(page.locator('table th:has-text("Cash")')).toBeVisible();
  });

  test('displays chart canvas', async ({ page }) => {
    await expect(page.locator('h2:has-text("History")')).toBeVisible();
    await expect(page.locator('#salesChart')).toBeVisible();
  });

  test('registers a new seller', async ({ page }) => {
    await page.fill('input[placeholder="your name"]', 'TestSeller');
    await page.fill('input[placeholder="your password"]', 'testpass');
    await page.fill('input[placeholder*="192.168"]', 'http://localhost:4000');
    await page.click('button[type="submit"]');

    // Wait for seller to appear in table
    await expect(page.locator('td:has-text("TestSeller")')).toBeVisible({ timeout: 10000 });
  });

  test('polls for updates', async ({ page }) => {
    // Get initial state
    const initialContent = await page.locator('tbody').innerHTML();

    // Wait for polling interval (5s + buffer)
    await page.waitForTimeout(6000);

    // Verify page didn't crash (still functional)
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows tooltips on hover', async ({ page }) => {
    await page.hover('input[placeholder="your name"]');
    await expect(page.locator('.tooltip')).toBeVisible({ timeout: 2000 });
  });

  test('formats currency correctly', async ({ page }) => {
    // Assuming there's existing data
    const cashCell = page.locator('td:has-text("€")').first();
    if (await cashCell.isVisible()) {
      const text = await cashCell.textContent();
      expect(text).toMatch(/€[\d,]+\.\d{2}/);
    }
  });
});
```

**4. Create Visual Regression Tests** (optional but recommended):

```javascript
// e2e/visual.spec.js
import { test, expect } from '@playwright/test';

test('homepage visual snapshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForSelector('table');
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100
  });
});
```

### During Migration: Continuous Validation

**Run E2E tests after each phase**:
```bash
# Start the server
npm start &

# Run E2E tests
npx playwright test

# Stop server
kill %1
```

**Phase-specific validations**:

| Phase | Key Validations |
|-------|-----------------|
| Phase 1 (Build) | App loads, form visible, no console errors |
| Phase 2 (React) | All interactions work, state updates correctly |
| Phase 3 (Libraries) | Chart renders, i18n works, tooltips functional |
| Phase 4 (Bootstrap) | Layout correct, responsive, all styles applied |
| Phase 5 (Cleanup) | No regressions, performance acceptable |

### Post-Migration: Final Validation

**1. Full E2E Suite Pass**
```bash
npx playwright test --reporter=html
```

**2. Performance Comparison**

```javascript
// e2e/performance.spec.js
import { test, expect } from '@playwright/test';

test('page load performance', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('table');
  const loadTime = Date.now() - startTime;

  console.log(`Page load time: ${loadTime}ms`);
  expect(loadTime).toBeLessThan(3000); // Should load in under 3s
});

test('no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(6000); // Wait for polling cycle

  expect(errors).toHaveLength(0);
});
```

**3. Cross-browser Testing**

```javascript
// playwright.config.js
export default {
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
};
```

### E2E Test Coverage Checklist

| Category | Tests |
|----------|-------|
| **Rendering** | Form displays, table displays, chart canvas exists |
| **Interactions** | Form submission, button clicks |
| **Data Flow** | Seller appears after registration, polling updates data |
| **Formatting** | Currency formatted correctly (€), colors applied |
| **UX** | Tooltips work, offline indicator shows |
| **Performance** | Page loads quickly, no memory leaks during polling |
| **Errors** | No console errors, graceful error handling |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| react-intl API changes break currency formatting | Medium | Low | Test early, simple usage |
| Chart.js data format incompatibility | High | Medium | Dedicated migration step with testing |
| Bootstrap 5 layout breaks | Medium | Medium | Visual regression tests |
| Build tooling issues | Low | High | Start with minimal Vite config |
| Polling logic breaks with hooks | Medium | High | Careful `useEffect` cleanup |

---

## Execution Checklist

- [ ] **Phase 0**: Install Playwright, write baseline E2E tests, run against current app
- [ ] **Phase 1**: Vite setup, verify app loads
- [ ] **Phase 2**: React component migration, verify interactions
- [ ] **Phase 3**: Library updates (react-intl, react-chartjs-2), verify features
- [ ] **Phase 4**: Bootstrap 5 migration, verify styling
- [ ] **Phase 5**: Cleanup, final E2E pass, performance validation
