# Migration automatique avec codemod

L'agent écrit le codemod et vous validez le résultat

## Exemple de prompt

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
**Timing**: 4 minutes (ou montrer en live)

**Objectif**: Démontrer le niveau le plus avancé - l'IA écrit du code qui transforme du code.

**Talking points**:
- "C'est le cas le plus puissant: l'IA écrit un programme qui modifie votre code"
- "On lui demande un codemod, il génère du jscodeshift"
- "Mais ATTENTION: on valide AVANT d'exécuter"
- "Dry-run TOUJOURS en premier - voir le diff avant de modifier"

**Déroulement si DEMO LIVE**:
1. Montrer le prompt (déjà affiché)
2. Lancer Claude Code avec le prompt
3. Attendre la génération du codemod
4. Expliquer le code pendant la génération:
   - "jscodeshift = AST transformation"
   - "Trouve tous les 'var'"
   - "Vérifie s'ils sont réassignés"
   - "Convertit en let ou const selon le cas"
5. Exécuter en dry-run: `npx jscodeshift --dry -t transform.js server/`
6. Montrer le diff
7. Valider manuellement quelques conversions
8. Appliquer (ou pas, selon le temps)

**CONTINGENCE SI PAS LE TEMPS**:
- Montrer juste les screenshots du codemod + diff
- "Voici ce que Claude a généré..."
- Passer plus de temps sur la validation

**Pour avancés**:
- "Vous pouvez générer des codemods pour toutes vos migrations"
- "Utile pour: prop renames, API migrations, import reorg"
- "Toujours valider le codemod généré - bugs possibles"

**Transition vers slide 18 (takeaways)**:
"Vous avez maintenant vu 4 démos, du plus simple (analyse) au plus complexe (automation). Récapitulons..."

**Énergie**: Impressionné mais prudent - montrer la puissance ET la nécessité de validation

**CHECKPOINT**:
"Quatrième demo: L'IA a ÉCRIT le codemod, nous VALIDONS le diff avant d'appliquer"
-->
