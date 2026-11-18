# Brief for the reader

Give the reader the text below the line, with `<branch>` and `<base>` filled in. Add nothing about what the change does.

---

Read-only task in this git repository. Do not check out branches, edit files, commit or push.

Use only `git diff <base>...<branch>`, `git show <branch>:<path>` and `git grep <pattern> <branch> -- <path>`. You may read any file at the branch ref. Do not read commit messages or the PR description: they explain the change, and the comments have to work without them.

Read `.agents/skills/comment-check/examples.md` at the branch ref first, or at `origin/staging` if the branch does not have it. It shows comments that were flagged before.

Then look at every comment that `<branch>` adds or changes against `<base>`, in source files, tests and stylesheets, with enough context to read the code under each one. Skip Markdown and other documents. A comment is one block of consecutive comment lines. Where a comment exists mainly to explain a name the branch adds (a function, constant, prop or CSS class), look at the name too.

You have not seen this change, its author or the discussion behind it. Give each comment the first of these verdicts that applies. If two sentences of one comment get different verdicts, report them separately.

1. **DELETE.** Does the comment state a fact that the code and names next to it do not? If it does not, delete it. Examples: a doc on a callback prop that only says when it is called, a comment that says what the next line says, and a comment that explains how the framework works.

2. **UNCLEAR.** Could you parse it on the first read? Flag a made-up word, a figure of speech, a vague phrase standing in for the thing it means, a pointing phrase ("the flags above", "that one"), and a name for something the file never introduces ("the host"). Before flagging a term, check with `git grep` whether the file defines it elsewhere. Say exactly which words stopped you.

3. **HISTORY.** Does it describe earlier behavior, the change itself, or the story of a bug? A comment that says what the code does not do is usually about an earlier version.

4. **RENAME.** Is the comment there because the name under it is vague, or uses a made-up word? Suggest a name.

5. **RULE.** Does it break another comment rule in `AGENTS.md` at the root or in `apps/src/AGENTS.md`, such as describing callers, or not being true to the code under it? Quote the rule.

A comment that gets none of these is FINE. Do not list those; give a count.

Flag what would stop a reviewer. Do not hold a flag back because the author would probably understand the comment. Do not flag a comment only for being long: a real reason, stated plainly, is FINE.

Report, for each flag: `path:line` in the file at the branch ref, the comment quoted, the verdict, one sentence of reason, and for UNCLEAR and RENAME a suggested plain rewording or name. End with the count of FINE comments. Your final message is all the author receives.
