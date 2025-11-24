# AGENTS.md

## Setup commands

- Install deps: `npm ci`
- Start dev server: `npm start` (serves at `http://localhost:3000`)
- Run tests: `npm test`
- Lint: `npm run lint`

## Project structure

```
├── app.js                    # Express app setup
├── bin/www                   # Server entry point
├── javascripts/              # Backend API
│   ├── config.js             # Configuration watcher
│   ├── repositories.js       # Seller storage
│   ├── routes.js             # API endpoints
│   ├── services/             # Business logic
├── public/                   # Frontend
└── specs/                    # Tests
```
