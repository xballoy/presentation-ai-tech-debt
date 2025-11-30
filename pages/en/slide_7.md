# What happens when you send a prompt?

<v-clicks>

1. Your prompt is **tokenized** (split into chunks)

   ```
   "Analyze this function" → ["Analyze", "this", "function"]
   ```

2. The model processes these tokens through its neural network

3. **Predicts the MOST LIKELY next token** based on learned patterns

   ```
   "def calculate(" → next token: probably "x" or "self"
   ```

4. Adds this token to the sequence

5. Repeats until generating a complete response

<div class="bg-yellow-100 p-4 rounded mt-6">

⚠️ **Key point**: "Most likely" ≠ "Correct"

This is **statistical prediction**, not magic.

</div>

</v-clicks>

<!--
**Timing**: 2 minutes

**Objective**: Explain why AI can be wrong - it's just probability.

**CRITICAL MESSAGE**: This slide explains why validation is necessary.

**Talking points**:
- "When you type a prompt, it's not sent as-is"
- "Tokenized = split into chunks (words, subwords, punctuation)"
- "The model predicts the MOST LIKELY next token"
- "**It's just statistics** - based on billions of examples"
- "That's why it can hallucinate - it predicts what SEEMS correct, not what IS correct"

**Concrete demonstration**:
- "If the model has seen 'def calculate(x)' 1000 times, it predicts 'x'"
- "If it's the first time it sees your specific function, it GUESSES"
- "Tokens ≠ words (a word can be multiple tokens)"
- "Sampling strategies: temperature, top-k, top-p affect probabilities"
- "Context window = how many previous tokens the model sees"

**Link to technical debt**:
- "Your legacy code = probably similar to code it has seen"
- "But your specific constraints = unique, it can guess wrong"
- "Hence: AI suggests, YOU validate with your context"

**Transition to slide 7**:
"Now that we understand the mechanism, let's see what AI can and CANNOT do..."

**Energy**: Educational with emphasis - demystify to better use
-->
