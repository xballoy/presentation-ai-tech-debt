# Supprimer plutôt que migrer

La meilleure dépendance, c'est celle qu'on n'a pas. L'agent identifie ce qui peut revenir à des APIs natives.

## Exemple de prompt

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
