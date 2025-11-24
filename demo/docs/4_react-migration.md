# React Migration Plan: 0.12.2 → 19.2

## Summary

Migrate frontend from React 0.12.2 (Bower, runtime JSX) to React 19.2 (Vite, modern hooks) while maintaining minimal structure and using native browser APIs.

**Decisions:**
- Build tool: Vite
- jQuery: Keep temporarily for AJAX
- E2E testing: Playwright
- i18n: Native `Intl.NumberFormat` (no react-intl)
- Structure: Minimal restructure (3 components)

## Current State

| Aspect | Current | Target |
|--------|---------|--------|
| React | 0.12.2 (Bower) | 19.2 (npm) |
| Build | Runtime JSX via JSXTransformer | Vite |
| Components | `React.createClass` | Functional + hooks |
| Refs | String refs (`this.refs.name.getDOMNode()`) | `useRef()` |
| State | `getInitialState` | `useState()` |
| Lifecycle | `componentDidMount`, `componentWillReceiveProps` | `useEffect()` |
| i18n | react-intl 1.1.0 | Native `Intl.NumberFormat` |
| Chart | Chart.js 1.x | Chart.js 4.x |

## Phase 1: E2E Baseline Tests (Before Migration)

Create Playwright tests with MSW mocked data against current implementation to establish behavioral contract.

### 1.1 Install Playwright and MSW

```bash
npm install -D @playwright/test msw playwright-msw
npx playwright install chromium
```

### 1.2 Create `playwright.config.js`

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 1.3 Create MSW Handlers `e2e/mocks/handlers.js`

```javascript
import { http, HttpResponse, delay } from 'msw';

// Mock data matching API response structure
export const mockSellers = [
  { name: 'Alice', cash: 1500.50, online: true },
  { name: 'Bob', cash: 2300.75, online: true },
  { name: 'Charlie', cash: 800.00, online: false },
];

export const mockSalesHistory = {
  history: {
    Alice: [100, 200, 350, 500, 750, 900, 1100, 1250, 1400, 1500],
    Bob: [50, 150, 400, 600, 900, 1200, 1500, 1800, 2100, 2300],
    Charlie: [200, 300, 400, 500, 600, 700, 750, 780, 790, 800],
  },
  lastIteration: 100,
};

export const handlers = [
  // GET /sellers - Return seller list
  http.get('/sellers', async () => {
    await delay(100);
    return HttpResponse.json(mockSellers);
  }),

  // GET /sellers/history - Return sales history
  http.get('/sellers/history', async () => {
    await delay(100);
    return HttpResponse.json(mockSalesHistory);
  }),

  // POST /seller - Register new seller
  http.post('/seller', async ({ request }) => {
    const body = await request.formData();
    const name = body.get('name');
    const url = body.get('url');

    await delay(100);

    if (!name || !url) {
      return HttpResponse.json({ error: 'Name and URL required' }, { status: 400 });
    }

    return HttpResponse.json({ success: true }, { status: 201 });
  }),
];

// Error scenario handlers for specific tests
export const errorHandlers = {
  serverError: http.get('/sellers', () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),
  emptySellers: http.get('/sellers', () => {
    return HttpResponse.json([]);
  }),
};
```

### 1.4 Create Test Fixture `e2e/test.js`

```javascript
import { test as base, expect } from '@playwright/test';
import { http, HttpResponse } from 'msw';
import { createWorkerFixture } from 'playwright-msw';
import { handlers } from './mocks/handlers.js';

// Extend Playwright test with MSW worker fixture
const test = base.extend({
  worker: createWorkerFixture(handlers),
  http,
});

export { test, expect };
```

### 1.5 Create `e2e/seller.spec.js`

```javascript
import { test, expect } from './test.js';
import { http, HttpResponse } from 'msw';
import { errorHandlers } from './mocks/handlers.js';

test.describe('Seller Dashboard - Baseline with Mocked API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays registration form with all fields', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /hello, seller/i })).toBeVisible();
    await expect(page.getByPlaceholder('your name')).toBeVisible();
    await expect(page.getByPlaceholder('your password')).toBeVisible();
    await expect(page.getByPlaceholder(/192\.168/)).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('displays mocked sellers in ranking table', async ({ page }) => {
    // MSW returns Alice, Bob, Charlie from handlers
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).toBeVisible();
    await expect(page.getByText('Charlie')).toBeVisible();
  });

  test('displays ranking table with headers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ranking/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /cash/i })).toBeVisible();
  });

  test('displays EUR currency formatting', async ({ page }) => {
    // Check currency format (German locale: 1.500,50 €)
    await expect(page.getByText(/1\.500,50/)).toBeVisible();
  });

  test('shows offline indicator for disconnected sellers', async ({ page }) => {
    // Charlie is offline in mock data
    const charlieRow = page.locator('tr', { hasText: 'Charlie' });
    await expect(charlieRow.locator('.glyphicon-alert')).toBeVisible();
  });

  test('displays history chart canvas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
    await expect(page.locator('canvas#salesChart')).toBeVisible();
  });

  test('form validation rejects empty name', async ({ page }) => {
    await page.getByPlaceholder(/192\.168/).fill('http://localhost:4000');
    await page.getByRole('button', { name: /register/i }).click();
    // Form should not clear (validation failed)
    await expect(page.getByPlaceholder(/192\.168/)).toHaveValue('http://localhost:4000');
  });

  test('seller registration clears form on success', async ({ page }) => {
    await page.getByPlaceholder('your name').fill('NewSeller');
    await page.getByPlaceholder('your password').fill('pass123');
    await page.getByPlaceholder(/192\.168/).fill('http://localhost:4000');
    await page.getByRole('button', { name: /register/i }).click();

    // Form should clear after successful submission
    await expect(page.getByPlaceholder('your name')).toHaveValue('');
  });
});

test.describe('Error Handling Scenarios', () => {
  test('handles empty seller list', async ({ page, worker }) => {
    await worker.use(errorHandlers.emptySellers);
    await page.goto('/');
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });

  test('can override mock data per test', async ({ page, worker }) => {
    await worker.use(
      http.get('/sellers', () => {
        return HttpResponse.json([
          { name: 'CustomUser', cash: 9999.99, online: true },
        ]);
      })
    );

    await page.goto('/');
    await expect(page.getByText('CustomUser')).toBeVisible();
  });
});
```

### 1.6 Run Baseline Tests

```bash
npx playwright test
```

**Checkpoint:** All tests must pass against current (legacy) React 0.12 app before proceeding with migration.

---

## Phase 2: Vite Infrastructure Setup

### 2.1 Add npm Dependencies

Update `package.json`:

```json
{
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "chart.js": "4.4.7"
  },
  "devDependencies": {
    "vite": "6.0.7",
    "@vitejs/plugin-react": "4.3.4",
    "@playwright/test": "1.49.1"
  },
  "scripts": {
    "dev:vite": "vite",
    "build:vite": "vite build",
    "preview": "vite preview",
    "test:e2e": "playwright test"
  }
}
```

### 2.2 Create `vite.config.js` (project root)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/sellers': 'http://localhost:3000',
      '/seller': 'http://localhost:3000',
    },
  },
});
```

### 2.3 Create `public/index-vite.html`

New entry point for Vite (copy structure from existing `index.html`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Extreme carpaccio</title>
  <link href="./components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="./stylesheets/style.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-inverse navbar-fixed-top">
    <div class="container">
      <div class="navbar-header">
        <a class="navbar-brand" href="#">Extreme carpaccio</a>
      </div>
    </div>
  </nav>
  <div id="seller"></div>

  <script src="./components/jquery/dist/jquery.min.js"></script>
  <script src="./components/bootstrap/dist/js/bootstrap.min.js"></script>
  <script src="./components/lodash/lodash.js"></script>
  <script type="module" src="./src/main.jsx"></script>
</body>
</html>
```

### 2.4 Create `public/src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client';
import { Seller } from './Seller.jsx';

const container = document.getElementById('seller');
const root = createRoot(container);
root.render(<Seller url="/seller" pollInterval={5000} historyFrequency={10} />);

// Initialize Bootstrap tooltips
$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
```

**Checkpoint:** Run `npm run dev:vite` - should show empty app shell at localhost:5173.

---

## Phase 3: Component Migration

### 3.1 Create `public/src/SellerForm.jsx`

```jsx
import { useRef, useCallback } from 'react';

export function SellerForm({ onSellerSubmit }) {
  const nameRef = useRef(null);
  const passwordRef = useRef(null);
  const urlRef = useRef(null);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const name = nameRef.current.value.trim();
    const password = passwordRef.current.value.trim();
    const url = urlRef.current.value.trim();

    if (!name || !url) {
      return;
    }

    onSellerSubmit({ name, password, url });

    nameRef.current.value = '';
    passwordRef.current.value = '';
    urlRef.current.value = '';
  }, [onSellerSubmit]);

  return (
    <div className="jumbotron">
      <h2>Hello, Seller!</h2>
      <form className="form-inline" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="sr-only">Name</label>
          <input
            type="text"
            placeholder="your name"
            className="form-control"
            ref={nameRef}
            data-toggle="tooltip"
            data-placement="bottom"
            title="Your username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            type="password"
            placeholder="your password"
            className="form-control"
            ref={passwordRef}
            data-toggle="tooltip"
            data-placement="bottom"
            title="Password is used if you want to register yourself on a different url..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="url" className="sr-only">URL</label>
          <input
            type="text"
            placeholder="http://192.168.1.1:3000"
            className="form-control"
            ref={urlRef}
            data-toggle="tooltip"
            data-placement="bottom"
            title="Base url of your own client"
          />
        </div>
        <button type="submit" className="btn btn-success">Register</button>
      </form>
    </div>
  );
}
```

### 3.2 Create `public/src/SellerView.jsx`

```jsx
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let j = 0; j < 3; j++) {
    color += ('00' + ((hash >> (j * 8)) & 0xff).toString(16)).slice(-2);
  }
  return color;
}

function formatChartData(salesHistory) {
  if (!salesHistory || _.isEmpty(salesHistory.history)) {
    return null;
  }

  const datasets = [];
  for (const seller in salesHistory.history) {
    const color = stringToColor(seller);
    datasets.push({
      label: seller,
      data: _.takeRight(salesHistory.history[seller], 10),
      borderColor: color,
      backgroundColor: 'transparent',
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      tension: 0,
    });
  }

  const labels = [];
  const lastIteration = salesHistory.lastIteration || 0;
  for (let i = 0; i < lastIteration; i += 10) {
    labels.push(String(i));
  }

  return {
    labels: _.takeRight(labels, 10),
    datasets,
  };
}

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export function SellerView({ data, salesHistory }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const chartData = formatChartData(salesHistory);

    if (!canvasRef.current) return;

    if (chartRef.current) {
      if (chartData) {
        chartRef.current.data = chartData;
        chartRef.current.update('none');
      }
    } else if (chartData) {
      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: chartData,
        options: {
          animation: false,
          responsive: false,
          plugins: {
            legend: { display: true },
          },
          elements: {
            line: { tension: 0 },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [salesHistory]);

  return (
    <div>
      <div className="row">
        <div className="col-md-4">
          <h2>Ranking</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Cash</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((seller) => {
                  const color = stringToColor(seller.name);
                  return (
                    <tr key={seller.name} style={{ color }}>
                      <td className="col-md-6">
                        <strong>{seller.name}</strong>
                      </td>
                      <td className="col-md-5">
                        {currencyFormatter.format(seller.cash)}
                      </td>
                      <td className="col-md-1">
                        {!seller.online && (
                          <span
                            title="offline"
                            className="glyphicon glyphicon-alert"
                            aria-hidden="true"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-8">
          <h2>History</h2>
          <canvas ref={canvasRef} id="salesChart" width="730" height="400" />
        </div>
      </div>
      <hr />
      <footer>
        <p>Have fun :D</p>
      </footer>
    </div>
  );
}
```

### 3.3 Create `public/src/Seller.jsx`

```jsx
import { useState, useEffect, useCallback } from 'react';
import { SellerForm } from './SellerForm.jsx';
import { SellerView } from './SellerView.jsx';

export function Seller({ url, pollInterval, historyFrequency }) {
  const [data, setData] = useState([]);
  const [salesHistory, setSalesHistory] = useState(null);

  const loadSellersFromServer = useCallback(() => {
    $.ajax({
      url: '/sellers',
      dataType: 'json',
      success: (result) => setData(result),
      error: (xhr, status, err) => console.error('/sellers', status, err.toString()),
    });
  }, []);

  const getSalesHistory = useCallback(() => {
    $.ajax({
      url: `/sellers/history?chunk=${historyFrequency}`,
      dataType: 'json',
      success: (result) => setSalesHistory(result),
      error: (xhr, status, err) => console.error('/sellers/history', status, err.toString()),
    });
  }, [historyFrequency]);

  const handleSellerSubmit = useCallback((newSeller) => {
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: newSeller,
      success: () => {
        setData((prev) => [...prev, { ...newSeller, cash: 0, online: true }]);
      },
      error: (xhr, status, err) => console.error(url, status, err.toString()),
    });
  }, [url]);

  useEffect(() => {
    loadSellersFromServer();
    getSalesHistory();

    const intervalId = setInterval(() => {
      loadSellersFromServer();
      getSalesHistory();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [loadSellersFromServer, getSalesHistory, pollInterval]);

  return (
    <div className="container">
      <SellerForm onSellerSubmit={handleSellerSubmit} />
      <SellerView data={data} salesHistory={salesHistory} />
    </div>
  );
}
```

**Checkpoint:** Run `npm run dev:vite` - full app should work at localhost:5173.

---

## Phase 4: E2E Validation (After Migration)

### 4.1 Update Playwright Config for Vite

Create `playwright-vite.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev:vite',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 4.2 Run Tests Against Vite Build

```bash
npx playwright test --config=playwright-vite.config.js
```

**Checkpoint:** All E2E tests must pass on Vite build.

---

## Phase 5: Production Cutover

### 5.1 Update Express to Serve Vite Build

Modify `app.js` to serve from `dist/` in production:

```javascript
// Add after existing static middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}
```

### 5.2 Swap HTML Entry Points

```bash
mv public/index.html public/index-legacy.html
mv public/index-vite.html public/index.html
```

### 5.3 Update npm Scripts

```json
{
  "scripts": {
    "start": "node ./bin/www",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jasmine-node --coffee specs",
    "test:e2e": "playwright test",
    "lint": "eslint ."
  }
}
```

### 5.4 Final E2E Validation

```bash
npm run build
npm start
npx playwright test
```

**Checkpoint:** All tests pass against production build.

---

## Phase 6: Cleanup

### 6.1 Remove Bower Dependencies

```bash
rm bower.json
rm -rf public/components
```

### 6.2 Remove Legacy Files

```bash
rm public/index-legacy.html
rm public/javascripts/seller.js
```

### 6.3 Update package.json

Remove from `package.json`:
- `"postinstall": "bower install"` script
- `bower` from devDependencies

### 6.4 Update .gitignore

Add:
```
dist/
node_modules/
test-results/
playwright-report/
```

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `package.json` | Add React 19, Vite, Playwright, MSW deps |
| `vite.config.js` | Create (new) |
| `playwright.config.js` | Create (new) |
| `e2e/mocks/handlers.js` | Create (new) - MSW mock handlers |
| `e2e/test.js` | Create (new) - Playwright fixture with MSW |
| `e2e/seller.spec.js` | Create (new) - E2E tests |
| `public/src/main.jsx` | Create (new) |
| `public/src/Seller.jsx` | Create (new) |
| `public/src/SellerForm.jsx` | Create (new) |
| `public/src/SellerView.jsx` | Create (new) |
| `public/index.html` | Replace with Vite entry |
| `app.js` | Add production static serving |
| `bower.json` | Delete |
| `public/components/` | Delete (entire directory) |
| `public/javascripts/seller.js` | Delete |

---

## Dependency Versions

```json
{
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "chart.js": "4.4.7"
  },
  "devDependencies": {
    "vite": "6.0.7",
    "@vitejs/plugin-react": "4.3.4",
    "@playwright/test": "1.49.1",
    "msw": "2.7.0",
    "playwright-msw": "3.0.1"
  }
}
```

**Note:** jQuery, Bootstrap 3, and Lodash remain via existing Bower install initially, then should be npm-installed or CDN-loaded after cleanup.

---

## Rollback Strategy

At any phase, revert by:
1. `git checkout -- .` to restore files
2. `npm ci && bower install` to restore dependencies
3. Original app continues working at localhost:3000

Both old and new apps can run simultaneously during migration:
- Legacy: `npm start` → localhost:3000
- Vite dev: `npm run dev:vite` → localhost:5173
