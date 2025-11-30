# Automated migration with codemod

The agent writes the codemod and you validate the result

## Example prompt

```text
Write a jscodeshift codemod to convert all var declarations to const/let based on reassignment.

Workflow:
1. Generate the codemod code
2. Explain what it does
3. Run with --dry-run on javascripts/*.js
4. Show me the diff of proposed changes
5. STOP and wait for my approval
6. After I approve, provide the final command to run without --dry-run

Do not execute the actual transformation until I explicitly approve.
```

<!--
**Timing**: 4 minutes (or show live)

**Objective**: Demonstrate the most advanced level - AI writes code that transforms code.

**Talking points**:
- "This is the most powerful case: AI writes a program that modifies your code"
- "We ask for a codemod, it generates jscodeshift"
- "But CAREFUL: we validate BEFORE executing"
- "Dry-run ALWAYS first - see the diff before modifying"

**Flow if LIVE DEMO**:
1. Show the prompt (already displayed)
2. Launch Claude Code with the prompt
3. Wait for codemod generation
4. Explain the code during generation:
   - "jscodeshift = AST transformation"
   - "Finds all 'var'"
   - "Checks if they're reassigned"
   - "Converts to let or const accordingly"
5. Execute in dry-run: `npx jscodeshift --dry -t transform.js server/`
6. Show the diff
7. Manually validate some conversions
8. Apply (or not, depending on time)

**CONTINGENCY IF NOT ENOUGH TIME**:
- Just show screenshots of codemod + diff
- "Here's what Claude generated..."
- Spend more time on validation

**For advanced users**:
- "You can generate codemods for all your migrations"
- "Useful for: prop renames, API migrations, import reorg"
- "Always validate the generated codemod - bugs are possible"

**Transition to slide 18 (takeaways)**:
"You've now seen 4 demos, from simplest (analysis) to most complex (automation). Let's recap..."

**Energy**: Impressed but cautious - show power AND need for validation

**CHECKPOINT**:
"Fourth demo: AI WROTE the codemod, we VALIDATE the diff before applying"
-->
