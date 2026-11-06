# Build an AI Agent — v5 (vanilla HTML/CSS/JS)

No React, no build step, no dependencies. Four files following the standard
lesson-app architecture:

- **index.html** — page structure (top bar, rail, palette, canvas, rules/brain panes, order window, verdict modal)
- **style.css** — all styles + animations (brain glow, gold execution pulse, pink tutorial spotlights, shimmer reasoning)
- **helpers.js** — data configs (PARTS, BLOCK_DEFS, LEVELS 1–5), inline SVG icons, agent logic, judge
- **script.js** — state, rendering, canvas engine (drag/wire/pan/zoom), tutorial, run orchestration

## AI modes

Set at the top of `helpers.js`:

```js
const AI_MODE = "auto";  // "auto" | "live" | "sim"
```

- **auto** (default) — tries the live Claude API first; if the call fails
  (no key, blocked network, non-claude.ai environment) it automatically
  falls back to the simulated agent and shows a SIM badge in the top bar.
- **live** — always uses the API. Works when pasted as a claude.ai artifact
  (the keyless proxy) or behind a proxy that injects credentials.
- **sim** — always uses the built-in simulated agent. Works anywhere,
  including Level Builder, with zero network access.

## The simulated agent

The sim is not canned playback — it reads the student's REAL wiring and
rules each run:

- No "use Check Menu" rule → the agent confidently sells pizza (Level 1 fail)
- Memory unwired or no Remember rule → it forgets Jordan's favorite (Level 2 fail)
- No backup rule → it apologizes without suggesting an alternative (fail: "nobody leaves without a scoop")
- No order-sequencing rule → it rings up 3 Strawberry scoops when only 2 exist
- No allergy-escalation rule → it guesses about nuts instead of texting Sam

Tool results run against real local shop state (the freezer genuinely
decrements), so the Register and Freezer node bodies update live either way.
The sim judge checks required tools were used plus per-level rule flags, and
gives the same hint-not-answer feedback style as the live judge.

## Single-file version

`build-an-ai-agent-v5-single-file.html` (in the parent folder) is the same
app with CSS + JS inlined — paste it into any IDE that wants one file.
