# Analyse du code

Prompt d'analyse de la dette technique

```text
Analyze this codebase for technical debt and architectural issues.

Focus on:
- Code smells and anti-patterns
- Outdated dependencies and framework versions
- Architectural problems (coupling, separation of concerns, etc.)
- Security vulnerabilities from deprecated packages
- Performance bottlenecks or inefficient patterns
- Missing error handling
- Inconsistent code patterns across the codebase

For each issue you identify:
1. Specify the exact location (file and line numbers)
2. Explain why it's problematic
3. Rate the severity (critical, high, medium, low)
4. Estimate effort to fix (hours or story points)
5. Suggest a specific remediation approach

After the analysis, generate a prioritized action plan with:
- Quick wins (high value, low effort)
- Critical issues that block modernization
- Long-term refactoring goals

Structure the output so each item can be addressed independently.
```

<!--
⚠️ On exécute le prompt et on explique pendant que ça tourne

**Timing**: 1-2 minutes

**Points clés sur le prompt**:
1. **Précision vs vague**
   - ❌ "Analyse la dette technique" (trop vague, résultats aléatoires)
   - ✅ Ce prompt: structuré, spécifique, format de sortie défini
   - "Regardez la structure - on spécifie EXACTEMENT ce qu'on cherche"

2. **Contenu du prompt**
   - Focus areas précis (smells, dépendances, architecture, sécurité...)
   - Format de sortie structuré (localisation, sévérité, effort, remédiation)
   - Action plan demandé (quick wins, critiques, long-terme)

3. **Comment créer un bon prompt**
   - Si vous ne savez pas quoi écrire, demandez à l'IA de vous donner un prompt
   - Soyez **précis** dans vos demandes
   - Guidances file: minimum nécessaire pour limiter la context window

- Ce prompt: ~150 tokens → réponse: ~2000-5000 tokens
- Trade-off constant: précision vs context window
- Guidances: enrichir itérativement plutôt que tout écrire d'un coup

**Transition**: "Maintenant regardons l'IA travailler en temps réel..."
-->
