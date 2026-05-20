# Et après ? Payer la dette en continu

Jusqu'ici : un dev qui rembourse la dette de manière réactive. La suite : des agents qui paient en continu.

<div class="grid grid-cols-2 gap-6">

<div>

### Le problème de drift

Les agents reproduisent les patterns existants, y compris les mauvais. Le code dérive lentement.

> Chez OpenAI, **20 % de la semaine (tous les vendredis) à nettoyer le « AI slop »** avant qu'ils n'automatisent ça.

Source : _Harness engineering_, Ryan Lopopolo, OpenAI (fév. 2026).

</div>

<div>

### La réponse : le harness

1. Encoder les « golden principles » dans le repo
2. Des agents en tâche de fond qui scannent les dérives
3. Des PRs de cleanup petites, ciblées, automerge
4. **Payer la dette de manière continue** plutôt qu'en gros chantiers périodiques

</div>

</div>

<br/>

### gh-aw — la version open source

[`github/gh-aw`](https://github.github.com/gh-aw/) : workflows agentiques dans GitHub Actions, déclarés en markdown.

```bash
gh extension install github/gh-aw
```
