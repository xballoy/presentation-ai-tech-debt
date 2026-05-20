# Automatiser avec un codemod sur mesure

L'IA cherche un codemod existant, et si rien ne convient, elle en écrit un avec dry-run et validation humaine.

## Exemple de prompt

```text
/codemod

Migrate our jasmine-node test suite to jest spy semantics:
- spyOn(x, y).andReturn(z)     → jest.spyOn(x, y).mockReturnValue(z)
- spyOn(x, y).andCallFake(fn)  → jest.spyOn(x, y).mockImplementation(fn)
- jasmine.any(Type)            → expect.any(Type)
```

**40+ occurrences sur 4 fichiers de specs.** Aucun codemod public n'existe pour cette transformation.

### Outil : [Codemod MCP](https://docs.codemod.com/model-context-protocol)

```bash
npx codemod ai
```
