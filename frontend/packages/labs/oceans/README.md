# **AI for Oceans**

This is the **AI for Oceans** lab from Code.org.

It originally lived in a standalone repo (`@code-dot-org/ml-activities`) and was consumed by the [main repo](https://github.com/code-dot-org/code-dot-org) as an npm dependency. It now lives inline in the monorepo at `frontend/packages/labs/oceans/`, published as the internal Turborepo workspace `@code-dot-org/oceans-lab`.

**AI for Oceans** was produced for the Hour of Code in 2019. This module provides the student experience for the 5 interactive levels in the **AI for Oceans** script at https://studio.code.org/s/oceans.

We have measured over one million unique [completions](https://twitter.com/codeorg/status/1385266661700288513) of the script.

![grid_comp](https://user-images.githubusercontent.com/2205926/165404102-87073dad-8d90-482a-ad68-bc475beb6b11.png)

# Design notes

## Modes

These 5 levels are invoked with a "mode" (stored internally as `appMode`) parameter:

### `fishvtrash`

The user trains the AI to differentiate between fish and trash, and then examines the results.

### `creaturesvtrashdemo`

Next, the concept of non-fish sea creatures is introduced to show that AI is only as good as its training. In this mode, the experience is abbreviated: the user doesn't do training, but rather the mode demonstrates what happens when fish-specific training encounters non-fish.

### `creaturesvtrash`

In this mode, the user trains the AI again, but this time encountering fish, non-fish creatures, and trash.

### `short`

In this mode, the user chooses from one of six adjectives and then categorizes fish based on that. The AI is trained on which fish fit into this arbitrary category or not, and then demonstrates this training.

### `long`

In this mode, the user chooses from one of fifteen adjectives. With more subjectivity in this list, the user can explore more subtle implications of training and categorization.

## ML technology

Adapted from content at https://code.org/oceans:

> Levels 2-4 (`fishvtrash`, `creaturesvtrashdemo`, `creaturesvtrash`) use a pretrained model provided by the [TensorFlow](https://www.tensorflow.org/) [MobileNet](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md) project. A MobileNet model is a [convolutional neural network](https://developers.google.com/machine-learning/practica/image-classification/convolutional-neural-networks) that has been trained on [ImageNet](http://www.image-net.org/), a dataset of over 14 million images hand-annotated with words such as "balloon" or "strawberry". In order to customize this model with the labeled training data the student generates in this activity, we use a technique called [Transfer Learning](https://en.wikipedia.org/wiki/Transfer_learning). Each image in the training dataset is fed to MobileNet, as pixels, to obtain a list of annotations that are most likely to apply to it. Then, for a new image, we feed it to MobileNet and compare its resulting list of annotations to those from the training dataset. We classify the new image with the same label (such as "fish" or "not fish") as the images from the training set with the most similar results.
>
> Levels 6-8 (`short`, `long`) use a [Support-Vector Machine](https://en.wikipedia.org/wiki/Support-vector_machine) (SVM). We look at each component of the fish (such as eyes, mouth, body) and assemble all of the metadata for the components (such as number of teeth, body shape) into a vector of numbers for each fish. We use these vectors to train the SVM. Based on the training data, the SVM separates the "space" of all possible fish into two parts, which correspond to the classes we are trying to learn (such as "blue" or "not blue").

## Scenes

The **AI for Oceans** script presents a linear narrative structure. This app is designed to deliver the interactive levels for this script, one mode at a time, with no need to persist data to the browser or server between each level.

The app itself presents a variety of "scenes", with each mode using a different subset. The scenes (known as `currentMode` internally) are as follows:

### `loading`

<img width="1328" alt="loading" src="https://user-images.githubusercontent.com/2205926/165404296-5f5c71df-6650-476b-8ada-b4e277a25a51.png">

A simple "loading" screen, used when loading or processing data.

### `words`

<img width="1301" alt="short" src="https://user-images.githubusercontent.com/2205926/165404312-26e8ca9b-847d-4d75-81bd-97bd735a55b0.png">

<img width="1301" alt="words" src="https://user-images.githubusercontent.com/2205926/165404326-83af55e8-0aaf-4541-94b8-e6f28946a9f3.png">

The user selects from a list of adjectives for the `short` & `long` modes.

### `train`

<img width="1299" alt="train" src="https://user-images.githubusercontent.com/2205926/165404433-39d8b295-92a1-4b1f-8bec-514cd38ec475.png">

The user trains the AI by choosing one of two options (true or false) for each item (fish, non-fish sea creatures, trash).

### `predict`

<img width="1301" alt="predict" src="https://user-images.githubusercontent.com/2205926/165404442-76f84923-e698-469c-ae3d-6f621f2b991c.png">

The user watches A.I. (the "bot") categorizing items, one at a time.

### `pond`

<img width="1297" alt="pond-true" src="https://user-images.githubusercontent.com/2205926/165404461-e42b3727-92ce-4243-b85c-98654517624a.png">

<img width="1298" alt="pond-false" src="https://user-images.githubusercontent.com/2205926/165404481-6e36e7d2-c6db-4e69-b84c-afd28f6444ba.png">

The user is shown the result of the predictions. The user can toggle between the matching & non-matching sets.

In the `short` and `long` modes, the pond also has a metapanel which can show general information about the ML processing, or, when a fish is selected, specific information about that fish's categorization:

<img width="1301" alt="pond_info" src="https://user-images.githubusercontent.com/2205926/165404496-396a1f6b-8c84-42bb-96d4-b369185b781f.png">

<img width="1302" alt="pond_fishinfo" src="https://user-images.githubusercontent.com/2205926/165404511-abb9b9c1-83f5-46fa-ad7c-e85ce0044abd.png">

## Graphics & UI

The app uses three layers in the DOM. Underneath, one canvas contains the scene's background image, while another canvas contains all the sprites. On top, the app uses React to render HTML elements for the user interface, implemented in `src/oceans/ui.tsx`.

The app is fully responsive by scaling the canvases and also scaling the size of the HTML elements correspondingly. This way, the UI simply shrinks to match the underlying canvases.

## Animation

The animation is designed to be be smooth and frame-rate independent.

The prediction screen notably renders the progression based on the concept of a "current offset in time", making it possible to pause, and even reverse the animation, as well as adjust its speed.

All items have simple "bobbing" animations, using offsets cycling in a sine loop, in `src/oceans/renderer.ts`.

The fish pause under the scanner using a simple S-curve adjustment to their movement, also in `src/oceans/renderer.ts`.

## The Guide

After initial playtests, we identified a need to slow the pacing of the tutorial and tell a clear story. The solution we adopted was text boxes with "typing" text, reminiscent of old-school computer games.

"The Guide" is the implementation of this solution, and was designed to be a simple but flexible system that allowed us to add a variety of text for every step and situation encountered in the tutorial.

Each piece of Guide text is declared, along with the app state needed for it to show (which can even include code for more expressiveness), in `src/oceans/models/guide.ts`.

This simple system enabled the team to add a detailed narrative voice to the script, and allowed a variety of team members to contribute text.

<img width="1301" alt="guide_arrow" src="https://user-images.githubusercontent.com/2205926/165404540-6bf26e57-876d-464f-b643-dcfb1bf2920f.png">

<img width="1300" alt="guide_arrow_bright" src="https://user-images.githubusercontent.com/2205926/165404544-d031c4f0-57e5-480a-8f12-55b426e430ef.png">

## Popups

We also use modal popups to give extra information.

<img width="1311" alt="popup" src="https://user-images.githubusercontent.com/2205926/165404670-4b556c6e-18e7-4ec6-b3d2-19c025c5b108.png">

## State

The app's runtime state is stored in a very simple module at `src/oceans/state.ts`. Updates to state trigger a React render, unless deliberately skipped.

## Host interface

The full functionality of this app is enabled when hosted by https://studio.code.org. The main repo loads this app via code at `apps/src/fish`. Specific parameters passed in during initialization (see `apps/src/fish/Fish.js`) include a foreground and background canvas, the `appMode`, a callback when the user continues to the next level, callbacks for loading & playing sound effects, and localized strings.

## Analytics

If Google Analytics is available on the page, the app generates a synthetic page view for each scene, allowing for an understanding of usage and duration of each scene in the script.

# Additional information

## Getting started

This package lives inside the `code-dot-org` monorepo. To work on it:

```
cd frontend/
yarn install
yarn turbo run dev --filter=@code-dot-org/oceans-lab
```

The standalone Vite dev server opens at [http://localhost:5173](http://localhost:5173) with live-reloading on file changes and a mode picker for all 5 app modes.

### Integration with the rest of the monorepo

`apps/` (webpack) and `frontend/apps/studio` (Vite) consume this package via `"@code-dot-org/oceans-lab": "workspace:*"`. Local edits are picked up by the next consumer build — no link/symlink step needed.

To rebuild the package's `dist/` for consumers:

```
yarn turbo run build --filter=@code-dot-org/oceans-lab
```

## Adding new fish components

All fish components live in `src/assets/images/fish` in their respective folders (eg bodies live in `body/`). Despite the fact that the fish face right in most of the tutorial, they are built as if they face left in order to simplify the math for the anchor points. This means that all components should be oriented as if the fish is facing left, which might require flopping any new assets. After adding the assets, they will need to be added to `src/utils/fishData.ts`. `bin/determineKnnData.js` will output some of the lines that will be needed in `fishData`.

All components can define `exclusions`, which are modes that the component won't be used in. Components appear in all modes by default.

Some components need more configuration:

### Bodies

Bodies need an anchor point for the body then all of the other components, relative to the bounds of the body image. A face anchor point is used for both the eyes and the mouth. The eyes and mouth are arranged with respect to each other and the defined anchor point. The tail Y anchor point is set from where the center of the component should be.

### Dorsal fin

Some dorsal fins define an x-adjustment to shift the anchor point. This is useful for dorsal fins that might look odd is not positioned correctly (eg symmetical).

## I18n

By default, this tutorial is in English. The strings live at `src/i18n/oceans.json` and should not be moved without corresponding changes to the I18n pipeline in `code-dot-org`. Translations can be passed into the app using the `i18n` param. If any translations are missing, the English string will be used as a default. This also means that adding a new string is safe and does not require any further steps.

## Machine Learning algorithms

We currently have support for two machine learning algorithms: k nearest neighbor (KNN) and support vector machine (SVM). We also have a mobilenet model that is saved at `src/oceans/model.json` (it's saved here to avoid a call to googleapis.com).
