---
name: comment-check
description: >-
  Check the code comments and new names a branch adds, by having a reader
  with no knowledge of the session read them cold. Use before pushing a
  branch or opening a PR, again after any later commit that adds or changes
  comments (review fixes included), and when asked to check a change against
  the repo's standards. Not for writing documentation or PR descriptions.
---

# Comment check

The comment rules are in the root `AGENTS.md` and `apps/src/AGENTS.md`. This skill does not add rules. It is the check that the rules were followed.

The check exists because the author cannot do it alone. After a long session you know what "the host", "the copy" and "held back" mean, so a comment that uses them reads fine to you. A reviewer has only the file.

## When to run it

- Before the first push of a branch.
- After every later commit that adds or changes a comment or a name, including the commit that fixes review feedback. A check covers the commit it ran on and nothing after.
- When the user asks for a standards check.

## Steps

1. **List.** Run `node .agents/skills/comment-check/list-comments.mjs [base]` (base defaults to `origin/staging`). It prints every comment line the branch adds or changes, and how many there are among the added lines. `apps/src/AGENTS.md` says to default to no comment, so a large share means most of the fixes will be deletions.

2. **Cold read.** Start a subagent with fresh context and give it `reader-brief.md` from this directory, with the branch name filled in. It must read the diff from git itself. Do not give it your summary of the change, your explanation of any term, or your own opinion of which comments are fine. If you cannot start a subagent, apply the four tests in `reader-brief.md` yourself, and say in your report that no outside reader was used.

3. **Verify each flag.** The reader can be wrong. A term it did not know may be defined at the top of the file (`git grep` for it). A comment it called deletable may carry a reason that the code does not show.

4. **Fix, in this order of preference.**
   - Delete the comment.
   - Change the name the comment was explaining, and then delete the comment.
   - Reword it in plain, literal words.

   Do not shorten an unclear comment. Shorter and still unclear is worse. Either it goes, or it says the fact in full.

5. **Read each rewording once more.** Every word in a name or a comment is a dictionary word, or an identifier that exists in the code. Two sentences in one comment do not contradict each other. Nothing in it describes what the code used to do.

6. **Run step 1 again** after the fixes, then lint and test as for any change.

7. **Report.** One line: the commit checked, how many comments were flagged, how many were fixed, and any flag left alone with its reason.

## What gets flagged

`examples.md` has real comments that a reviewer flagged, each with the test it fails and what replaced it. Read it before fixing, not only when a flag is unclear.

## Limits

- `list-comments.mjs` scans by line. It misses a comment that follows code on the same line.
- A rename is a code change. Typecheck and test it, and name it in the commit message and the report.
- This is a check on comments and names. It does not review the code's behavior.
