# Comment fonctionne un LLM ?

Trois grandes étapes pour créer un LLM :

<v-clicks>

<div>

**1. Pré-entraînement**

Le modèle apprend à prédire le prochain token à partir de milliards d'exemples de texte.

<div class="text-sm mt-4 text-gray-600">

💰 Millions de $ · ⏱️ Semaines/mois · 🖥️ Milliers de GPU

</div>
</div>

<div>

**2. Fine-tuning supervisé (SFT)**

Le modèle apprend à suivre des instructions à partir d'exemples annotés par des humains.

<div class="text-sm mt-4 text-gray-600">

📊 Moins de données · 👤 Exemples sélectionnés · 🎯 Suivi d'instructions

</div>
</div>

<div>

**3. Apprentissage par renforcement avec feedback humain (RLHF)**

Le modèle apprend à être utile, honnête et inoffensif via les préférences humaines.

<div class="text-sm mt-4 text-gray-600">

👥 Feedback humain · 🏆 Reward model · ✅ Alignement

</div>
</div>

</v-clicks>

<!--
**1. Pré-entraînement**:
- "Apprentissage massif sur internet, livres, code"
- "Next Token Prediction sur des corpus gigantesques"
- "Coûte des millions de dollars - c'est pourquoi VOUS ne pouvez pas en créer un"

**2. Fine-tuning supervisé (SFT)**:
- "On lui apprend à suivre des instructions avec des exemples annotés"
- "Beaucoup moins de données, beaucoup moins cher"
- "C'est ici qu'un modèle devient bon pour le code, le dialogue, etc."

**3. RLHF (Reinforcement Learning from Human Feedback)**:
- "On lui apprend à préférer les bonnes réponses via du feedback humain"
- "Modèle de récompense entraîné sur des préférences humaines"
- "Objectif: utile, honnête, inoffensif (HHH)"
-->
