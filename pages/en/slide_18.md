# Automate with a custom codemod

The AI looks for an existing codemod, and if none fits, writes one with dry-run and human validation.

## Example prompt

```text
/codemod

Migrate our jasmine-node test suite to jest spy semantics:
- spyOn(x, y).andReturn(z)     → jest.spyOn(x, y).mockReturnValue(z)
- spyOn(x, y).andCallFake(fn)  → jest.spyOn(x, y).mockImplementation(fn)
- jasmine.any(Type)            → expect.any(Type)
```

**40+ occurrences across 4 spec files.** No public codemod exists for this transformation.

### Tool: [Codemod MCP](https://docs.codemod.com/model-context-protocol)

```bash
npx codemod ai
```
