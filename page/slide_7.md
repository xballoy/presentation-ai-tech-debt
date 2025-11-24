# Que se passe-t-il quand vous envoyez un prompt ?

<v-clicks>

1. Votre prompt est **tokenisé** (divisé en morceaux)

   ```
   "Analyse cette fonction" → ["Analyse", "cette", "fonction"]
   ```

2. Le modèle traite ces tokens à travers son réseau de neurones

3. **Prédit le token suivant LE PLUS PROBABLE** basé sur les patterns appris

   ```
   "def calculate(" → next token: probablement "x" ou "self"
   ```

4. Ajoute ce token à la séquence

5. Répète jusqu'à générer une réponse complète

<div class="bg-yellow-100 p-4 rounded mt-6">

⚠️ **Point clé** : "Le plus probable" ≠ "Le correct"

C'est de la **prédiction statistique**, pas de la magie.

</div>

</v-clicks>

<!--
**Timing**: 2 minutes

**Objectif**: Expliquer pourquoi l'IA peut se tromper - c'est juste de la probabilité.

**MESSAGE CRITIQUE**: Ce slide explique pourquoi la validation est nécessaire.

**Talking points**:
- "Quand vous tapez un prompt, ce n'est pas envoyé tel quel"
- "Tokenisé = découpé en morceaux (mots, sous-mots, ponctuation)"
- "Le modèle prédit le token suivant le PLUS PROBABLE"
- "**C'est juste de la statistique** - basé sur des milliards d'exemples"
- "C'est pourquoi il peut halluciner - il prédit ce qui SEMBLE correct, pas ce qui EST correct"

**Démonstration concrète**:
- "Si le modèle a vu 1000 fois 'def calculate(x)', il prédit 'x'"
- "Si c'est la première fois qu'il voit votre fonction spécifique, il DEVINE"
- "Tokens ≠ mots (un mot peut être plusieurs tokens)"
- "Sampling strategies: temperature, top-k, top-p affectent les probabilités"
- "Context window = combien de tokens précédents le modèle voit"

**Lien avec la dette technique**:
- "Votre code legacy = probablement similaire à du code qu'il a vu"
- "Mais vos contraintes spécifiques = uniques, il peut deviner faux"
- "D'où: AI suggests, VOUS validez avec votre contexte"

**Transition vers slide 7**:
"Maintenant qu'on comprend le mécanisme, voyons ce que l'IA peut et ne peut PAS faire..."

**Énergie**: Pédagogique avec emphase - démystifier pour mieux utiliser
-->
