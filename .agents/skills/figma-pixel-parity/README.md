# Figma pixel parity

Portable Cursor skill extracted from the CADS Figma↔code parity workflow. It is the closed loop that stops an agent from calling a component done after reading code or glancing at a screenshot.

This repo keeps the skill in `.agents/skills/figma-pixel-parity/`. Claude Code loads that directory through the `.claude/skills` symlink. Do not add a `.local` suffix: those directories are gitignored.

`repo.md` beside `SKILL.md` is already filled for this library. Commit it with the skill so every agent uses the same bindings.

Leave this copy out of the CADS repo. CADS already runs the stricter `cads-parity-qa` skill.
