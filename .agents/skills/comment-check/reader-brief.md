# Brief for the reader

Give the reader the text below the line, with `<branch>` and `<base>` filled in. Add nothing about what the change does.

---

Read-only task in this git repository. Do not check out branches, edit files, commit or push.

Use only `git diff <base>...<branch>`, `git show <branch>:<path>` and `git grep <pattern> <branch> -- <path>`. You may read any file at the branch ref, and number its lines with `cat -n`. Do not read commit messages or the PR description: they explain the change, and the comments have to work without them.

Read `.agents/skills/comment-check/examples.md` at the branch ref first, or at `origin/staging` if the branch does not have it. It shows comments that were flagged before.

Then look at every comment that `<branch>` adds or changes against `<base>`, in source files, tests and stylesheets, with enough context to read the code under each one. Skip Markdown and other documents. A comment is one block of consecutive comment lines, and it counts as changed if any of its lines changed. Where a comment exists mainly to explain a name the branch adds (a function, constant, prop or CSS class), look at the name too.

You have not seen this change, its author or the discussion behind it. Give each comment the first of these verdicts that applies. If two sentences of one comment get different verdicts, report them separately.

1. **DELETE.** The comment states no fact that the code and names next to it do not already give. Examples: a doc on a callback prop that only says when it is called, a comment that says what the next line says, and a comment that explains how the framework works. A comment that gives one fact the code lacks is not a DELETE, even if the rest of it restates the code.

2. **UNCLEAR.** You could not parse it on the first read. Flag a made-up word, a figure of speech, a vague phrase standing in for the thing it means, a pointing phrase ("the flags above", "that one"), and a name for something the file never introduces ("the host"). Before flagging a term, check with `git grep` whether the file defines it elsewhere. Say exactly which words stopped you.

3. **HISTORY.** It describes earlier behavior, the change itself, or the story of a bug. A comment that says what the code does not do is often about an earlier version. A stated limit of the code is not history.

4. **RENAME.** The comment is there because the name under it is vague, or uses a made-up word. Suggest a name.

5. **RULE.** It breaks another comment rule in `AGENTS.md` at the root or in `apps/src/AGENTS.md`, both read at the branch ref. Examples: it describes callers, or it is not true to the code under it. Quote the rule.

A comment that gets none of these is FINE. Do not list those; give a count.

Flag what would stop a reviewer. Do not hold a flag back because the author would probably understand the comment. Do not flag a comment only for being long: a real reason, stated plainly, is FINE.

Report, for each flag: `path:line` in the file at the branch ref, the comment quoted, the verdict, one sentence of reason, and for UNCLEAR and RENAME a suggested plain rewording or name. End with the count of FINE comments. Your final message is all the author receives.
