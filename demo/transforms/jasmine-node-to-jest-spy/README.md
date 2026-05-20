# jasmine-node-to-jest-spy

Rewrites jasmine-node spy semantics to their jest equivalents.

## Transformations

| Before                                | After                                          |
| ------------------------------------- | ---------------------------------------------- |
| `spyOn(x, 'y').andReturn(z)`          | `jest.spyOn(x, 'y').mockReturnValue(z)`        |
| `spyOn(x, 'y').andCallFake(fn)`       | `jest.spyOn(x, 'y').mockImplementation(fn)`    |
| `jasmine.any(Type)`                   | `expect.any(Type)`                             |

Matches are AST-based (ast-grep patterns on `CallExpression`/`MemberExpression`), so they only rewrite the intended call sites — bare identifiers named `spyOn` or `jasmine` elsewhere are left alone.

## Scope and limitations

This codemod only rewrites the three patterns above. It is **not** a full jasmine-node → jest migration. In particular, it does not:

- Convert bare `spyOn(x, 'y')` calls (no `.andReturn` / `.andCallFake` chain) to `jest.spyOn(...)`. These still need a global `spyOn` to be in scope, so the suite will not run on jest until they are also migrated.
- Replace the test runner (`jasmine-node` → `jest`), `package.json` scripts, or add a `jest` config.
- Touch other jasmine-specific globals (`jasmine.createSpy`, `jasmine.objectContaining`, etc.).

Targets: `**/*.{js,jsx,mjs,cjs}`, excluding `node_modules`, `dist`, `build`.

## Usage

```bash
# Validate
npx codemod@latest workflow validate -w workflow.yaml

# Dry-run against a target repo
npx codemod@latest workflow run -w workflow.yaml --target <path> --dry-run --no-interactive --allow-dirty

# Apply
npx codemod@latest workflow run -w workflow.yaml --target <path> --no-interactive --allow-dirty
```

## Development

```bash
npm test
```

Test fixtures live under `tests/<case>/{input,expected}.js` and cover:

- `and-return-basic` — single-argument `.andReturn`
- `and-return-object-literal` — multiline object literal argument
- `and-call-fake-empty-fn` — `.andCallFake(function () {})`
- `jasmine-any-basic` — multiple `jasmine.any(Function)` in one expectation
- `combined-realistic` — all three patterns in one `describe`/`it` block
- `negative-bare-spyOn` — bare `spyOn(x, 'y')` is left unchanged
- `negative-expect-any-untouched` — existing `expect.any(...)` is not double-rewritten
- `noop-no-jasmine` — no patterns present, file unchanged

## License

MIT
