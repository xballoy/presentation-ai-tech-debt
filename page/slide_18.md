# Remplacement par des APIs natives

L'agent identifie quand une dépendance peut être remplacée par des APIs natives de la plateforme.

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

<!--
**Timing**: 2-3 minutes

**Objectif**: Montrer comment réduire la dette technique en éliminant les dépendances inutiles.

**MESSAGE CLÉ**: La meilleure dépendance est celle qu'on n'a pas.

**Talking points**:
- "Beaucoup de libraries sont obsolètes depuis ES6/ES2020"
- "lodash était essentiel en 2015, moins nécessaire aujourd'hui"
- "L'agent peut identifier ce qui est remplaçable"
- "Vous décidez si l'effort en vaut la peine"

**Exemples à développer**:
- moment.js → Intl: "moment fait 67KB, Intl est natif et supporte i18n"
- lodash → natives: "90% des usages de lodash sont remplaçables"
- axios → fetch: "fetch est standard, supporte streaming natif"

**Transition vers slide 18**:
"Maintenant qu'on a vu comment réduire la dette, voyons les limites..."

**Énergie**: Optimiste - montrer les gains concrets
-->
