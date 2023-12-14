# Dance AI Modal

## UI

https://github.com/code-dot-org/code-dot-org/assets/2205926/1dca6294-fad7-46c7-8ee0-368c798c2600

The Dance AI modal accompanies a new AI block added to Dance Party for the Hour of Code in 2023.  The modal allows the user to select three emoji that will then be used to generate an effect, which is a combination of an existing Dance Party foreground and background effect.  This combination effect can be used as-is, or the user can view the equivalent code and even convert the AI block into that code.

### Architecture

The most deliberate architectural decision was to not divide the modal by discrete "screens" or "pages", but to instead ensure that all elements would be available at all times.  This allowed us to do things like keep the A.I. bot visible throughout the experience.  In early builds, we even slid it around the modal to carry out various tasks in different places.

To ensure smoother display during the generating sequence, we fade each new visualization over the top of the previous one.

### Modes

There are a several primary modes in the modal's UI.

#### select inputs
The user selects three emoji, with the ability to deselect as well.  Once three are chosen, the generating process can begin.

#### generating
The modal presents a series of effects that are lower-scoring candidates.  It then presents the high-scoring candidate that was chosen as the winner.

#### results
The winner continues to be shown, and a variety of options are presented:
- toggle to code, or back again to the visualization;
- regenerate, using the same emojis;
- start over, to pick new emojis;
- view explanation;
- use this effect, which closes the modal;
- and finally, when toggled to code, convert to code, which closes the modal and replaces the AI block with the actual foreground and background effect blocks.

#### explanation
The explanation shows some of the lower-scoring candidates, and the winning candidate, along with stacked bar charts which show the inpact of each emoji on that decision.

### Notable UI pull requests

Amongst many pull requests created during the ~10 week core development period, these were some of the more notable UI changes.

- The initial work was a developer-pitched idea to use an LLM which would generate the output from a prompt: https://github.com/code-dot-org/code-dot-org/pull/53769
- Next, the modal was built, and emoji selection added, still with the LLM, which would also attempt to explain its choices: https://github.com/code-dot-org/code-dot-org/pull/53889
- Next, the modal explanation evolved to show a generating sequence from emoji -> neural network -> blocks -> visualization: https://github.com/code-dot-org/code-dot-org/pull/54246
- Explanations were added, and were initially quite detailed: https://github.com/code-dot-org/code-dot-org/pull/54346
- We added a header to the modal which reflected the AI block's appearance, to help make it clearer that this work was happening inside the block: https://github.com/code-dot-org/code-dot-org/pull/54365
- After some classroom tests, we changed the generating sequence to show a series of low-scoring candidates before the winner, now with live previews too: https://github.com/code-dot-org/code-dot-org/pull/54552
- We simplified the explanation bar chart and also used it in the generating mode: https://github.com/code-dot-org/code-dot-org/pull/54732
- We adjusted the generating sequence, with a series of candidates that fade into each other and speed up, also removing the bar chart from it: https://github.com/code-dot-org/code-dot-org/pull/54982
- We then adjusted the generating sequence again, showing the previews at a slower and consistent pace: https://github.com/code-dot-org/code-dot-org/pull/55104

### Challenges

There were some interesting design challenges:

- A block that has a field is quite natural to Blockly.  However, there was also interest in letting users advance to a situation in which they could output the underlying code; we settled on a transformation of one block into several, but that is less natural to Blockly.  For the code generation scenario, it could have made sense to have an alternate UI which doesn't begin with a block, but instead simply emits blocks to the workspace.
- Delivering a visual representation of what's happening inside the AI was quite challenging, especially for an Hour of Code audience which could be first-timer coders who are looking to have a fun session.  In the end, we settled on showing a range of possible output visualizations, with the A.I. bot looking happy with a good one.
- There was a desire to show that the AI process was generating parameters used in code which in turn rendered the output effect, but in versions where we showed the code blocks before showing the visualization there was user confusion.  We settled on a simpler flow which immediately shows visualizations, and allows the user to toggle into a view of the code.  This enables curious users to go "behind the scenes" and see that there is real code, while maintaining a main flow that shows a simpler connection directly from emojis to the resulting visualization.
