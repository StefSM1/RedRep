## CRITICAL: TOOL CALL FORMATTING FOR MINIMAX

When you use the `ask_followup_question` tool, you MUST pass a single, raw, flat text string inside the `<question>` parameter.

- NEVER structure your question as a JSON object.
- NEVER include bracketed option arrays like `["Option A", "Option B"]` inside the tool parameters.
- If you have options to present, write them as standard markdown bullet points completely inside the text string of the question parameter itself.

Failure to follow this format will cause the internal parser to crash with a TypeError.
