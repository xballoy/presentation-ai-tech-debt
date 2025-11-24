# Codemod: var to const/let

## Codemod Created: `docs/codemods/var-to-const-let.js`

### What it does

- Converts `var` → `const` when the variable is never reassigned
- Converts `var` → `let` when the variable is reassigned (via `=`, `+=`, `-=`, `++`, `--`, or used in `for-in`/`for-of`)

### Detection logic

1. Finds all `var` declarations in the file
2. For each variable, searches its scope for:
   - Assignment expressions (`x = ...`, `x += ...`)
   - Update expressions (`x++`, `--x`)
   - For-in/for-of left-hand assignments
3. If reassigned → `let`, otherwise → `const`

## Files Affected (8 of 9)

| File | Changes |
|------|---------|
| `config.js` | 6 var → const |
| `repositories.js` | 22 var → const, 2 var → let |
| `routes.js` | 9 var → const |
| `utils.js` | 5 var → const |
| `services/dispatcher.js` | 18 var → const, 6 var → let |
| `services/order.js` | 9 var → const, 2 var → let |
| `services/reduction.js` | 3 var → const |
| `services/seller.js` | 13 var → const, 5 var → let |

`services/index.js` was unmodified (no `var` declarations).

## Notable `let` Conversions (reassigned variables)

- `lastRecordedValue` in `repositories.js:44` - conditionally reassigned
- `offlinePenalty` in `dispatcher.js:137` - reassigned when invalid
- `sum` in `order.js:42` - modified by tax/reduction
- `message`, `loss` in `seller.js:85-86` - conditionally assigned
- Loop iterators (`i`, `item`, `seller`)

## Execution

To apply the transformation:

```bash
npx jscodeshift -t codemods/var-to-const-let.js javascripts/*.js javascripts/services/*.js
```

To preview changes without modifying files:

```bash
npx jscodeshift -t codemods/var-to-const-let.js --dry --print javascripts/*.js javascripts/services/*.js
```
