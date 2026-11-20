---
name: comment-check
description: >-
  Check the code comments a branch adds or changes, and the names those
  comments explain, by having someone who has not seen the change read them.
  Use before any push that adds or changes a comment, including a push of
  review fixes, and as the comment part of any review of a change against
  the repo's standards. Not for writing documentation or PR descriptions.
---

# Comment check

The comment rules are in the root `AGENTS.md` and in `apps/src/AGENTS.md`. This skill is the check that they were followed.

The author cannot do this check alone. The author knows the names made up along the way, such as "the host", so a comment that uses them reads fine to the author. A reviewer has only the file.

The check needs a **reader**: someone who has not seen the change or the conversation that produced it. For a coding agent, the reader is a subagent started without the agent's conversation. For a person, the reader is a colleague.

## When to run it

Before any push that adds or changes a comment. That includes a push of review fixes: a check covers the commits it read and nothing after them.

## Steps

1. **Commit, then list.** The reader sees committed work only. Run `node .agents/skills/comment-check/list-comments.mjs [base]` (base defaults to `origin/staging`). It prints the comment lines the branch adds or changes, and their count. If it prints none, stop here.

2. **Hand over.** Give the reader the text below the line in `reader-brief.md`, with `<branch>` and `<base>` filled in. Let the reader run `git diff` itself. Do not paste the diff, a summary of the change, the meaning of any term, or your opinion of which comments are fine. If no reader is available, apply the tests in the brief yourself, and say in your report that the author was the only reader.

3. **Compare.** The reader's flags plus its count of FINE comments should cover the comments in the list from step 1. Ask about any it skipped.

4. **Fix each flag.** `examples.md` has flagged comments and what replaced them. Read it first.
   - DELETE: remove the comment.
   - RENAME: change the name. Then remove the comment, unless it still states a fact the new name does not.
   - UNCLEAR: reword it in plain, literal words. Do not fix it by shortening it. Clear comes before short: a comment that is needed may take a second sentence, and still states one fact.
   - HISTORY: remove the part about the past. It belongs in the PR description.
   - RULE: follow the rule the reader quoted.

   Leave a flag unfixed only when you can point to the line in the file that defines the term, or to the fact that the comment states and the code does not.

5. **Check each rewording.**
   - Every word in it is a dictionary word, an identifier that exists in the code, or a term the codebase already uses.
   - Its sentences do not contradict each other.
   - Nothing in it describes what the code used to do.

6. **Commit the fixes, and check them once.** If you reworded a comment or changed a name, repeat steps 2 to 5 with `<base>` set to the commit before the fixes, so that the reader reads only the fixes. Use a new reader. Lint and test as for any change; a rename also needs a typecheck.

7. **Report** to the person you are working for: the last commit that was read, how many comments were flagged, how many were fixed, each flag left alone with its reason, each rename, and who the reader was.

## Limits

- `list-comments.mjs` matches lines against patterns. Its first lines say what it misses.
- A name is read only where a comment explains it. A made-up name with no comment is not caught.
- This is a check on comments and names. It does not review what the code does.
