# Brief for the cold reader

Give the reader this text, with `<branch>` and `<base>` filled in. Add nothing about what the change does.

---

Read-only task in this git repository. Do not check out branches, edit files, commit or push. Use `git diff`, `git show` and `git grep <pattern> <ref> -- <path>`.

Look at every comment line that `<branch>` adds or changes against `<base>` (`git diff <base>...<branch>`, with enough context to read the code under each comment), in source, tests and stylesheets. Look also at the names of the functions, constants, props and CSS classes the branch adds, where a comment exists mainly to explain the name.

You are an engineer who knows this codebase in general and has never seen this change, its author or the discussion behind it. Judge each comment by these tests, in order, and stop at the first one it fails:

1. **Delete.** If the comment were removed, would a reader lose a fact that the code and names right there do not already give? If not, the verdict is DELETE. A doc on a callback prop that describes what the caller does, a comment that says what the next line says, and a comment that explains how the framework works all fail here.

2. **Cold read.** Can you parse it on the first read? Flag a word the author seems to have coined, a figure of speech, a sentence compressed until words are missing, a pointing phrase ("the flags above", "that one"), and an actor the file never introduces ("the host"). Before flagging a term, check with `git grep` at the branch ref whether the file defines it elsewhere. The verdict is UNCLEAR. Say exactly which words stopped you.

3. **History.** Does it describe earlier behavior, the change itself, or the story of a bug, and not what the code does now and why? The verdict is HISTORY.

4. **Name.** Is the comment there because the name under it is vague, or is not a real word? The verdict is RENAME, with a suggested name.

A comment that passes all four is FINE. Do not list those; give a count.

The repo's own rules are in `AGENTS.md` at the root and in `apps/src/AGENTS.md`. Apply what they say about comments too. Comments use American spelling and full, plain sentences.

Be specific, not generous. Fifteen real flags are worth more than sixty marginal ones, but do not hold a flag back because the author would probably understand the comment. A real reason stated plainly is FINE even when it is long.

Report, for each flag: `path:line` in the file at the branch ref, the comment quoted, the verdict, one sentence of reason, and for UNCLEAR and RENAME a suggested plain rewording or name. End with the count of FINE comments. Your final message is all the author receives.
