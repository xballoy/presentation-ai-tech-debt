---
layout: two-cols-header
---

# How does an LLM work?

The two key steps to create an LLM:

::left::

<v-clicks>
<div>

**Pre-training**: models analyze billions of text examples, learning to predict what comes next

<div class="text-sm mt-4 text-gray-600">

💰 Millions of $ / ⏱️ Weeks/months / 🖥️ Thousands of GPUs

</div>
</div>

</v-clicks>

::right::

<v-clicks>

<div>

**Fine-tuning**: models are refined to follow instructions, be helpful, and avoid harmful content

<div class="text-sm mt-4 text-gray-600">

📊 Less data / 👤 Human feedback / ✅ Desired behavior

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

**Objective**: Demystify LLMs - they're not magic oracles.

**Talking points**:
- "To understand how to use AI, you need to understand how it's created"
- "Pre-training = massive learning on internet, books, code"
- "Costs millions of dollars - that's why YOU can't create one"
- "Fine-tuning = we teach the model to follow instructions, be helpful"
- "Cheaper, uses human feedback"
- "Pre-training uses Next Token Prediction on massive corpora"
- "Fine-tuning includes instruction-tuning and RLHF (Reinforcement Learning from Human Feedback)"
- "That's why some models are better for code (fine-tuned on GitHub)"

**Why it matters for technical debt**:
- "Pre-training = the model has SEEN lots of legacy and modern code"
- "Fine-tuning = it has learned to HELP developers"
- "But it doesn't know YOUR context - that's why validation is critical"

**Transition to slide 6**:
"Now, what happens when you send it a prompt?"

**Energy**: Educational - teaching the fundamentals
-->
