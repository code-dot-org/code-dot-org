# AI level catalog

`build.py` writes one self-contained HTML page listing every level in a
stable course that puts an AI model in front of students: AI Chat levels,
Web Lab 2 levels, and App Lab, Game Lab, Web Lab and Python Lab levels with
AI Tutor turned on. Courses open to units, lessons and levels; each level
shows its type, whether AI is essential or optional, the model it runs, and
its studio.code.org link.

The data comes from the curriculum files under `dashboard/config`, not from
a database, so the page reflects whatever revision is checked out. The rules
for "essential" and for which model a level runs mirror
`Level.with_essential_ai_chat_tools`,
`Unit::NAMES_EXEMPT_FROM_ESSENTIAL_AI_CHAT_TOOLS` and
`apps/src/aichatLab/utils/validateModelId.ts`; the page's "How this list was
built" panel states them in full.

## Running it

From the repository root, with Python 3 and PyYAML:

    python3 tools/scripts/aiLevelCatalog/build.py /tmp/ai-level-catalog.html

It takes one to two minutes, mostly reading the 65,000 level files.
`template.html` is the page; `build.py` fills in its `/*...*/` placeholders.

## The published copy

The catalog is published as a claude.ai artifact,
https://claude.ai/artifact/KuKXDUyfsZeyVXSEctDyym. Its "Refresh data"
button, shown only to the artifact's owner, starts the claude.ai Routine
named in `REFRESH_TRIGGER_ID`. The Routine checks out the latest `staging`,
runs this script, and republishes the artifact. A new owner needs a Routine
of their own and that constant changed to its id.

## The CodeAI Cloud copy

The same page is deployed as a static site, `ai-tools-catalog`, on CodeAI
Cloud. It does not refresh itself; redeploy it to update it. The deploy
broker is reachable only from the internal network, so run this from a
laptop on it, in Claude Code with the codeai-cloud plugin:

    git fetch origin staging && git checkout --detach origin/staging
    git checkout <branch with this tool> -- tools/scripts/aiLevelCatalog   # until it is on staging
    mkdir -p ~/ai-tools-catalog
    python3 tools/scripts/aiLevelCatalog/build.py --standalone ~/ai-tools-catalog/index.html

Then, in `~/ai-tools-catalog`, ask Claude to `/deploy` it as the existing
static project `ai-tools-catalog`, internal. Keep that folder: the
`codeai-cloud.yaml` the first deploy writes there makes later redeploys a
single `ship`.
