# Que se passe-t-il quand vous envoyez un prompt ?

1. Votre prompt est **tokenisé** (divisé en morceaux)

   ```
   "Analyse cette fonction" → ["Analyse", "cette", "fonction"]
   ```

2. Le modèle traite ces tokens à travers son réseau de neurones

3. **Prédit le token suivant LE PLUS PROBABLE** basé sur les patterns appris

   ```
   "Analyse cette" → next token: probablement "fonction"
   ```

4. Ajoute ce token à la séquence

5. Répète jusqu'à générer une réponse complète

<div class="bg-yellow-100 p-4 rounded mt-6">

⚠️ **Point clé** : "Le plus probable" ≠ "Le correct"

C'est de la **prédiction statistique**, pas de la magie.

</div>
