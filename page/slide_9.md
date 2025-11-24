---
layout: two-cols
---

# Capacités clés

<v-clicks>

<div>

✅ **Analyse massive**

- Milliers de lignes quelques secondes
</div>
<div>

✅ **Reconnaissance de patterns**

- Anti-patterns, code smells

</div>
<div>

✅ **Apprentissage par l'exemple**

- Donne-lui des exemples, il adapte

</div>
<div>

✅ **Connexion outils**

- Lire fichiers, exécuter code
</div>

</v-clicks>

::right::

# Limitations

<v-clicks>

<div>

⚠️ **Knowledge cutoff** (dépend des modèles)

- Ne connaît pas versions récentes des librairies par exemple
</div>
<div>

⚠️ **Hallucinations**

- Peut inventer des APIs
</div>
<div>

⚠️ **Context window** (~200K tokens)

- Limite de mémoire = ~500 pages
</div>
<div>

⚠️ **Raisonnement complexe**

- Algorithmes, maths avancées
</div>

</v-clicks>

<!--
**Timing**: 2 minutes

**Objectif**: Établir des attentes réalistes - l'IA est puissante MAIS limitée.

**MESSAGE CRITIQUE**: Comprendre les limitations explique POURQUOI on valide.

**Talking points**:
- "Ces capacités sont RÉELLES - l'IA peut vraiment analyser 10,000 lignes instantanément"
- "Mais les limitations sont CRITIQUES à comprendre"
- "Si vous ignorez les limitations, vous allez avoir de mauvaises surprises"

**Dérouler les capacités**:
- "Analyse massive = ce qui prendrait des heures à un humain"
- "Pattern recognition = vu des millions d'exemples, détecte les anti-patterns"
- "Apprentissage par l'exemple = few-shot learning, donnez 2-3 exemples"
- "Connexion outils = agents comme Claude Code peuvent lire/écrire fichiers"

**Dérouler les limitations**:

**Knowledge cutoff**:
- "Le modèle a été entraîné jusqu'à janvier 2025"
- "Il ne connaît pas les packages sortis après"
- "Peut suggérer des versions obsolètes"

**Hallucinations**:
- "LE PLUS DANGEREUX: il invente avec confiance"
- "Peut citer une fonction qui n'existe pas"
- "Peut donner une API incorrecte"
- "C'est pourquoi on VALIDE contre la documentation officielle"

**Context window**:
- "~200K tokens = environ 500 pages, 150K mots"
- "Si votre codebase est plus grande, il ne peut pas tout voir"
- "Doit choisir quels fichiers lire"
- "C'est pourquoi on est précis dans les prompts - économiser le contexte"

**Raisonnement complexe**:
- "Mauvais pour math complexes, algorithmes sophistiqués"
- "Bon pour patterns connus, pas pour invention algorithmique"
- "Peut écrire du code qui SEMBLE correct mais a des bugs subtils"
- "200K tokens context = spécifique à Claude 3.5"
- "GPT-4 a 128K, Gemini 1M+"
- "Mais plus de contexte ≠ meilleure qualité nécessairement"
- "Attention à la 'lost in the middle' problem avec grands contextes"

**Pourquoi c'est critique pour dette technique**:
- "Votre code legacy peut être plus grand que le context window"
- "L'IA peut halluciner des migrations qui n'existent pas"
- "Les estimations sont basées sur probabilités, pas votre vélocité réelle"

**Transition vers slide 8**:
"Avec ces capacités et limitations en tête, voici ce qu'on va accomplir aujourd'hui..."

**Énergie**: Équilibrée - enthousiaste sur les capacités, sérieux sur les limitations
-->
