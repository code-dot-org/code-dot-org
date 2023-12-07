# Dance AI Modal

## UI

The Dance AI modal accompanies a new AI block added to Dance Party for Hour of Code in 2023.  The modal allows the user to select three emoji that will then be used to generate an effect, which is a combination of an existing Dance Party foreground and background effect.  This combination effect can be used as-is, or the user can view the equivalent code and even convert the AI block into those foreground and background effect blocks.

### Modes

#### select inputs
The user selects three emoji, with the ability to deselect as well.  Once three are chosen, the generation process can begin.

#### generating
The modal presents a series of effects that are lower-scoring candidates.  It then presents the high-scoring candidate that was chosen as the winner.

#### results
The winner continues to be shown, and a variety of options are presented: toggle to code, or back again to the visualization; regenerate, using the same emojis; start over, to pick new emojis; view explanation; use this effect, which closes the modal; and finally, when toggled to code, convert to code, which closes the modal and replaces the AI block with the actual foreground and background effect blocks.

#### explanation
The explanation shows some of the lower-scoring candidates, and the winning candidate, along with stacked bar charts which show the inpact of each emoji on that decision.

### Notable UI pull requests

Amongst many pull requests created during the 10 week development period, these were some of the more notable UI changes.

- The initial work was a developer-pitched idea to use an LLM which would both generate the output from a prompt: https://github.com/code-dot-org/code-dot-org/pull/5376
- Next, the modal was built, emoji selection added, still with the LLM, which would also attempt to explain its choices: https://github.com/code-dot-org/code-dot-org/pull/5388
- Next, the modal explanation evolved to go from emoji -> neural network -> blocks -> visualization: https://github.com/code-dot-org/code-dot-org/pull/5424
- Initial explanations were quite detailed: https://github.com/code-dot-org/code-dot-org/pull/5434
- We added a header to the modal which reflected the AI block's appearance, to help make it clearer that this work was happening inside the block: https://github.com/code-dot-org/code-dot-org/pull/5436
- After some classroom tests, we changed the generation to show a series of low-scoring candidates before the winner, now with live previews too: https://github.com/code-dot-org/code-dot-org/pull/54552
- We simplified the explanation bar chart and also used it in the generating mode: https://github.com/code-dot-org/code-dot-org/pull/54732
- We adjusted the generating mode, with a series of candidates that fade into each other and speed up, also removing the bar chart from there: https://github.com/code-dot-org/code-dot-org/pull/54982
- We then adjusted the generating mode again, showing the previews at a slower and consistent pace: https://github.com/code-dot-org/code-dot-org/pull/5510
