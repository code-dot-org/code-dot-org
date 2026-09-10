# 03 — Student's App Lab button does nothing

**Verdict: HELPED**

## Path taken
- CodeAI Documentation (home) — 0 clicks (start)
- App Lab (Students > Labs) — 1 click. This page answered everything.

## Answering sentence
"The button is on the screen, but nothing happens when you click it. You need to tell App Lab what to do when someone clicks." — followed by steps to add an onEvent block. Also: "If nothing happens, check that the id in onEvent matches the id you gave the button in Design mode exactly. Capitalization matters: startBtn and startbtn are not the same."

## Confusion points
- Page never says "event handler" — only "the onEvent block." Persona would not know what to search for next time.
- "In the toolbox, open the UI controls category and drag the onEvent block into the workspace" — does not emphasize the button needs an id already set; mentioned only parenthetically later.
- Debug Console troubleshooting says "A red error message means your program stopped at that line" — does not say where the Debug Console is or how to open it beyond "below the code editor."
- First paragraph promises "steps that get your first app running" but buries the troubleshooting fix three sections down. No skip-to link for "if you already did this and it's still not working."

## Screenshots
Zero images on the entire App Lab page. No picture of the Design tab, toolbox, or onEvent block. Biggest miss: told to "drag the onEvent block" with no idea what it looks like or where to find it. A crop of the Code tab with UI controls open and onEvent highlighted would have saved hunting.

## Product test
Not completed. /projects/applab/new redirected to /users/sign_in. No anonymous App Lab entry point available. Environment limitation, not something a real student would hit at school.

## Three wishes
1. "Tell me the fancy word for this (event handler) so I can search for it next time."
2. "Show me a picture of what the onEvent block looks like so I know what I'm dragging."
3. "Put the troubleshooting for 'nothing happens' at the top, since that's literally why I came here."
