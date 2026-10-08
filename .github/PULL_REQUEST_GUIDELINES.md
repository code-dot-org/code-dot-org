# PR content
## PR length
Large updates should be broken down into smaller PRs when possible to make them easier to review. AI tools can help split large PRs. Exceptions (e.g., large data files) should be noted in the PR description so reviewers know what to focus on.

## Code quality
- Code should not be over-engineered. It is the engineering team's responsibility to weigh the cost of any added complexity against the real-world benefit.
- Code should be well-named and well-factored.

## Comments
- Be concise and don't repeat other comments.
- State why the code does what it does, when the reason isn't obvious from reading it. Don't explain how it works when that's already clear.
- Provide information needed to understand the current state of the code, not a description of what changed from a prior state.
- Focus on the code within the comment's scope (current line, block, method, or file). References to code outside that scope should give only enough detail for the reader to decide whether to follow them.
- Avoid references to the current behavior of other code; these become stale when that code changes.
- When high-level context is needed to understand the technical details of a subsystem spanning multiple files, consolidate that context to a single location, such as a tech spec, a markdown file, or a single file-level comment.

# PR descriptions
## Description content
- Omit unnecessary technical detail, especially around how the change works.
- Include enough context to bring an unfamiliar reviewer up to speed.
- Follow [pull_request_template.md](pull_request_template.md) and be concise.

## Writing style
- Use plain English and existing terminology.
- Avoid AI-generated jargon or unnatural sentence structure.
- Clarify whether action steps were taken by the human author or an AI agent.
- "Me", "myself", and "I" all refer exclusively to the human author, unless explicitly noted otherwise (e.g. via quoting and attribution). Use another subject (Claude, Codex, AI, the agent, etc) to describe steps performed by an AI agent.
