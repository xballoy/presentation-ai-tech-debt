---
layout: two-cols-header
---

# Comment fonctionne un LLM ?

Les deux étapes clés pour créer un LLM :

::left::

<v-clicks>
<div>

**Pre-training** : les modèles analysent des milliards d'exemples de texte, apprenant à prédire ce qui vient ensuite

<div class="text-sm mt-4 text-gray-600">

💰 Millions de $ / ⏱️ Semaines/mois / 🖥️ Milliers de GPU

</div>
</div>

</v-clicks>

::right::

<v-clicks>

<div>

**Fine-tuning** : les modèles sont affinés pour suivre des instructions, être utiles et éviter le contenu nuisible

<div class="text-sm mt-4 text-gray-600">

📊 Moins de données / 👤 Feedback humain / ✅ Comportement souhaité

</div>
</div>

</v-clicks>

<style>
.two-cols-header {
  column-gap: 16px;
}
</style>

<!--
**Timing**: 2 minutes

**Objectif**: Démystifier les LLMs - ce ne sont pas des oracles magiques.

**Talking points**:
- "Pour comprendre comment utiliser l'IA, il faut comprendre comment elle est créée"
- "Pre-training = apprentissage massif sur internet, livres, code"
- "Coûte des millions de dollars - c'est pourquoi VOUS ne pouvez pas en créer un"
- "Fine-tuning = on apprend au modèle à suivre des instructions, être utile"
- "Moins cher, utilise le feedback humain"
- "Pre-training utilise Next Token Prediction sur des corpus massifs"
- "Fine-tuning inclut instruction-tuning et RLHF (Reinforcement Learning from Human Feedback)"
- "C'est pourquoi certains modèles sont meilleurs pour le code (fine-tuned sur GitHub)"

**Pourquoi c'est important pour la dette technique**:
- "Pre-training = le modèle a VU beaucoup de code legacy et moderne"
- "Fine-tuning = il a appris à AIDER les développeurs"
- "Mais il ne connaît pas VOTRE contexte - c'est pourquoi la validation est critique"

**Transition vers slide 6**:
"Maintenant, que se passe-t-il quand vous lui envoyez un prompt?"

**Énergie**: Pédagogique - enseigner les fondamentaux
-->
