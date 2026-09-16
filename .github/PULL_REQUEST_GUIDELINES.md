# PR content
## PR length
Large updates (i.e., anything over 500 lines of code) should be broken down into smaller PRs when possible to make them easier to review. AI tools can help split large PRs. Exceptions (e.g., large data files) should be noted in the PR description so reviewers know what to focus on.

## Code quality
- Code should not be over-engineered. It is the engineer's responsibility to weigh the cost of any added complexity against the real-world benefit.
- Code should be well-named and well-factored.
- Good naming makes code readable without the need for line-by-line comments.
- Engineers should use their judgment on whether it is appropriate to refactor modified or adjacent code.

## Comments
- Be concise and don't repeat other comments.
- State why the code does what it does, when the reason isn't obvious from reading it. Don't explain how it works when that's already clear.
- Provide information needed to understand the current state of the code, not a description of what changed from a prior state.
- Focus on the code within the comment's scope (current line, block, method, or file). References to code outside that scope should give only enough detail for the reader to decide whether to follow them.
- Avoid references to the current behavior of other code; these become stale when that code changes.
- When context spans multiple files, put it in a markdown file and reference it from the comment rather than inlining it.

# PR descriptions
## Authorship
- "Me", "myself", and "I" all refer exclusively to the human author, unless explicitly noted otherwise (e.g. via quoting and attribution). Use another subject (Claude, Codex, AI, the agent, etc) to describe steps performed by an AI agent.
- When AI-generated text describes work done by the PR author, prefer using the author's name or github handle rather than "I" language for added clarity.
- Passive voice is ambiguous (e.g. "Was manually verified"). If the description uses the passive voice, it's fair for reviewers to ask who performed the action.

## Description content
- Describe the human intent of the change: what prompted it and how we arrived at the current solution. Don't infer intent from the implementation.
- Describe what is changing conceptually and why the approach is appropriate. Omit unnecessary technical detail, especially around how the change works.
- Include enough context to bring an unfamiliar reviewer up to speed.
- Follow the PR template and be concise.

## Writing style
- Use plain English and existing terminology.
- Avoid chain-of-thought reasoning, AI-generated jargon, and other unnatural sentence structure.
- Clarify whether action steps were taken by the human author or an AI agent.
