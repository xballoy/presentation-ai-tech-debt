# Formalize what the agent must know

Without context, the agent replicates what it sees in the code, including bad practices.

<div class="grid grid-cols-2 gap-6">

<div>

### `AGENTS.md`

Always loaded into the context.

```md
# Conventions

- Tests: vitest, not jasmine
- Logger: pino, never console.*
- No moment.js
```

</div>

<div>

### Skills

The agent reads descriptions in context and loads the full content when the task matches.

- **Auto**: `writing-tests`, `debugging`, `pr-content`…
- **Explicit**: `/code-review`, `/codemod`, `/release`

</div>

</div>

<br/>

### Tool: [rulesync](https://rulesync.dyoshikawa.com/)

Single source → configs for **25+ tools**: Claude Code, Cursor, Copilot, Gemini CLI, Codex, Cline… Rules, skills, commands, MCP, permissions.

```bash
npx rulesync generate
```
