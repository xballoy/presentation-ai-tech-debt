# Formaliser ce que l'agent doit savoir

Sans contexte, l'agent réplique ce qu'il voit dans le code, y compris les mauvaises pratiques.

<div class="grid grid-cols-2 gap-6">

<div>

### `AGENTS.md`

Toujours chargé dans le contexte.

```md
# Conventions

- Tests: vitest, pas jasmine
- Logger: pino, jamais console.*
- Pas de moment.js
```

</div>

<div>

### Skills

L'agent lit les descriptions en contexte et charge le contenu complet quand la tâche correspond.

- **Auto** : `writing-tests`, `debugging`, `pr-content`…
- **Explicite** : `/code-review`, `/codemod`, `/release`

</div>

</div>

<br/>

### Outil : [rulesync](https://rulesync.dyoshikawa.com/)

Source unique → configs pour **25+ outils** : Claude Code, Cursor, Copilot, Gemini CLI, Codex, Cline… Rules, skills, commands, MCP, permissions.

```bash
npx rulesync generate
```