Agent skills extend AGENTS.md to specialized domains and tasks without
filling everyone's context all the time.

See standard at: https://agentskills.io/

Rather than lengthening AGENTS.md, consider adding a new skill and comitting
it to git for everyone to benefit from.

Skills matching `.agents/skills/*.local` are not committed to git, use this
directory for personal skills.

NOTE: `.claude/skills` is symlinked to this directory, all other agents
should discover `.agents/skills` automatically.
