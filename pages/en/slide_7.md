# What happens when you send a prompt?

1. Your prompt is **tokenized** (split into chunks)

   ```
   "Analyze this function" → ["Analyze", "this", "function"]
   ```

2. The model processes these tokens through its neural network

3. **Predicts the MOST LIKELY next token** based on learned patterns

   ```
   "Analyze this" → next token: probably "function"
   ```

4. Adds this token to the sequence

5. Repeats until generating a complete response

<div class="bg-yellow-100 p-4 rounded mt-6">

⚠️ **Key point**: "Most likely" ≠ "Correct"

This is **statistical prediction**, not magic.

</div>
