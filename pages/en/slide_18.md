# Replacement with native APIs

The agent identifies when a dependency can be replaced with native platform APIs.

## Example prompt

```text
Analyze our use of lodash in the codebase.

Identify functions that can be replaced with native JavaScript APIs.

For each replacement:
- Show the native equivalent
- Confirm identical behavior
- Highlight any edge cases
- Estimate migration effort

Prioritize high-usage functions first.
```

<!--
**Timing**: 2-3 minutes

**Objective**: Show how to reduce technical debt by eliminating unnecessary dependencies.

**KEY MESSAGE**: The best dependency is one you don't have.

**Talking points**:
- "Many libraries are obsolete since ES6/ES2020"
- "lodash was essential in 2015, less necessary today"
- "The agent can identify what's replaceable"
- "You decide if the effort is worth it"

**Examples to develop**:
- moment.js → Intl: "moment is 67KB, Intl is native and supports i18n"
- lodash → natives: "90% of lodash usage is replaceable"
- axios → fetch: "fetch is standard, supports native streaming"

**Transition to slide 18**:
"Now that we've seen how to reduce debt, let's look at the limits..."

**Energy**: Optimistic - show concrete gains
-->
