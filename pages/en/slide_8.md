---
layout: two-cols
---

# Key capabilities

<v-clicks>

<div>

✅ **Massive analysis**

- Thousands of lines in seconds
</div>
<div>

✅ **Pattern recognition**

- Anti-patterns, code smells

</div>
<div>

✅ **Learning by example**

- Give it examples, it adapts

</div>
<div>

✅ **Tool connection**

- Read files, execute code
</div>

</v-clicks>

::right::

# Limitations

<v-clicks>

<div>

⚠️ **Knowledge cutoff** (varies by model)

- Doesn't know recent library versions for example
</div>
<div>

⚠️ **Hallucinations**

- Can invent APIs
</div>
<div>

⚠️ **Context window** (~200K tokens)

- Memory limit
</div>
<div>

⚠️ **Complex reasoning**

- Algorithms, advanced math
</div>

</v-clicks>

<!--
**Timing**: 2 minutes

**Objective**: Set realistic expectations - AI is powerful BUT limited.

**CRITICAL MESSAGE**: Understanding limitations explains WHY we validate.

**Talking points**:
- "These capabilities are REAL - AI can actually analyze 10,000 lines instantly"
- "But the limitations are CRITICAL to understand"
- "If you ignore the limitations, you'll have bad surprises"

**Walk through capabilities**:
- "Massive analysis = what would take hours for a human"
- "Pattern recognition = seen millions of examples, detects anti-patterns"
- "Learning by example = few-shot learning, give 2-3 examples"
- "Tool connection = agents like Claude Code can read/write files"

**Walk through limitations**:

**Knowledge cutoff**:
- "The model was trained until January 2025"
- "It doesn't know packages released after that"
- "Can suggest outdated versions"

**Hallucinations**:
- "THE MOST DANGEROUS: it invents with confidence"
- "Can cite a function that doesn't exist"
- "Can give an incorrect API"
- "That's why we VALIDATE against official documentation"

**Context window**:
- "~200K tokens = about 500 pages, 150K words"
- "If your codebase is larger, it can't see everything"
- "Has to choose which files to read"
- "That's why we're precise in prompts - to save context"

**Complex reasoning**:
- "Bad at complex math, sophisticated algorithms"
- "Good for known patterns, not for algorithmic invention"
- "Can write code that LOOKS correct but has subtle bugs"
- "200K tokens context = specific to Claude 3.5"
- "GPT-4 has 128K, Gemini 1M+"
- "But more context ≠ necessarily better quality"
- "Watch out for 'lost in the middle' problem with large contexts"

**Why it's critical for technical debt**:
- "Your legacy code may be larger than the context window"
- "AI can hallucinate migrations that don't exist"
- "Estimates are based on probabilities, not your actual velocity"

**Transition to slide 8**:
"With these capabilities and limitations in mind, here's what we'll accomplish today..."

**Energy**: Balanced - enthusiastic about capabilities, serious about limitations
-->
