# Code analysis

Technical debt analysis prompt

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
⚠️ Run the prompt and explain while it's running

**Timing**: 1-2 minutes

**Key points about the prompt**:
1. **Precision vs vague**
   - ❌ "Analyze technical debt" (too vague, random results)
   - ✅ This prompt: structured, specific, defined output format
   - "Look at the structure - we specify EXACTLY what we're looking for"

2. **Prompt content**
   - Precise focus areas (smells, dependencies, architecture, security...)
   - Structured output format (location, severity, effort, remediation)
   - Action plan requested (quick wins, critical, long-term)

3. **How to create a good prompt**
   - If you don't know what to write, ask the AI to give you a prompt
   - Be **specific** in your requests
   - Guidances file: minimum necessary to limit the context window

- This prompt: ~150 tokens → response: ~2000-5000 tokens
- Constant trade-off: precision vs context window
- Guidances: enrich iteratively rather than writing everything at once

**Transition**: "Now let's watch the AI work in real time..."
-->
