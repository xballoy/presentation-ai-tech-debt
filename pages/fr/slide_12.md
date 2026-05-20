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
- Claude: mode Sandbox (Docker sbx)
- Utilisation du mode Plan
    - lecture seule (enforced par le prompt seulement)
    - idéal pour l'exploration et les reviews
-->
