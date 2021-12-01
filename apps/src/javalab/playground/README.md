# Playground Mini-App

This portion of Java Lab contains the views and the presentation logic for the
Playground mini-app.

The Playground is a simple interface for creating interactive experiences in Java.
The scenarios are limited to simple games like tic-tac-toe, Checkers, or Connect Four.
The Playground has a similar presentation to the Theater, but the Playground does not
have a script. Rather, the Playground simply presents images & text on a “board” that
can also play sounds.

It is worth noting that the Playground is intended to be treated as a prototype,
even after its launch as part of the pilot curriculum. This means that, while the feature
is intended to be used by teachers and supported in the pilot curriculum and SY22-23,
it may be significantly or entirely redesigned in the future (starting SY23-24).

### Views

The Playground views consist of:

- [`PlaygroundVisualizationColumn.jsx`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/javalab/PlaygroundVisualizationColumn.jsx):
  contains the Playground visualization, which is rendered within left sidebar
- [`PlaygroundImage.jsx`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/javalab/PlaygroundImage.jsx):
  renders a single Playground image
- [`PlaygroundText.jsx`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/javalab/PlaygroundText.jsx):
  renders a single Playground text view

`PlaygroundImage` and `PlaygroundText` items are visualizations of corresponding item data
sent from Javabuilder, and are inserted into `PlaygroundVisualizationColumn`. If a `PlaygroundImage`
is presenting a clickable item, it also has a click listener function that is invoked on click.

### Presentation/Business Logic

Presentation and business logic is managed by:

- [`Playground.js`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/javalab/Playground.js):
  manages the state of the mini-app, consumes updates from Javabuilder, updates
  items in the Playground, and sends messages back to Javabuilder
- [`playgroundRedux.js`](https://github.com/code-dot-org/code-dot-org/blob/staging/apps/src/javalab/playgroundRedux.js):
  contains action creators and a reducer for the Playground state. The Playground
  state consists of all the items on the Playground and their display properties.

### Interactions with Javabuilder

Playground games are driven by click interactions. If a clickable item is added to the
Playground, Java Lab needs to indicate to Javabuilder when that item has been clicked.
It does this by attaching an onClick listener that is called when the item is clicked,
which causes Java Lab to send a message to Javabuilder containing the ID of the clicked
item. After Javabuilder processes the click handler, it sends back updates which are
consumed in `Playground.js`. These updates can be adding/removing items, updating item
properties, setting a background image, or playing a sound. If items are changed
(added, removed, or updated), the `Playground.js` updates the Playground state in redux.
The updated state is then read in `PlaygroundVisualizationColumn.jsx` which re-renders all
the items as per the new state. If updating background image or playing a sound,
`Playground.js` manipulates the DOM directly.

`Playground.js` also consumes START and END messages from Javabuilder to keep track of the state
of the game. This ensures that click messages are only sent while the game is in progress.

### Resources & Further Reading

#### Documentation

- [Playground Technical Design Document](https://docs.google.com/document/d/1Moo2s5EXZRp5rMg1VW9jlOqs_GeMN5yjU8FJgoqOEMk/edit?usp=sharing)
- [CSA Capabilities Spec](https://docs.google.com/document/d/14S47uuVF-hzxYeiw4ap-WqlN4A8ctUOypPNTwRKGh6c/edit#heading=h.6v77hisrc3uw)

#### Links

- [Javalab Playground All the Things Level](https://studio.code.org/s/allthethings/lessons/44/levels/9)
- [javabuilder Playground package](https://github.com/code-dot-org/javabuilder/tree/main/org-code-javabuilder/playground)
