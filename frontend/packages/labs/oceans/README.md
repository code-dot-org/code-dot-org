[![Build Status](https://github.com/code-dot-org/ml-activities/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/code-dot-org/ml-activities/actions/workflows/deploy.yml)


# **AI for Oceans**

This is the repo for **AI for Oceans** from Code.org.

Like the Dance Party repo, it is a standalone repo that is published as an [NPM package](https://www.npmjs.com/package/@code-dot-org/ml-activities), and consumed by the [main repo](https://github.com/code-dot-org/code-dot-org).

**AI for Oceans** was produced for the Hour of Code in 2019.  This module provides the student experience for the 5 interactive levels in the **AI for Oceans** script at https://studio.code.org/s/oceans.

# Design notes

## Modes

These 5 levels are invoked with a "mode" (stored internally as `appMode`) parameter:

### `fishvtrash`

The user trains the AI to differentiate between fish versus trash, and then examine the results.

### `creaturesvtrashdemo`

Next, the concept of non-fish sea creatures is introduced to show that AI is only as good as its training.  In this mode, the experience is abbreviated: the user doesn't do training, but rather the mode demonstrates what happens when fish-specific training encounters non-fish.

### `creaturesvtrash`

In this mode, the user trains the AI again, but this time encountering fish, non-fish creatures, and trash.

### `short`

In this mode, the user chooses from one of six adjectives and then categorizes fish based on that.  The AI is trained on which fish fit into this arbitrary category or not, and then demonstrates this training.

### `long`

In this mode, the user chooses from one of fifteen adjectives.  With more subjectivity in this list, the user can explore more subtle implications of training and recognition.

## ML technology

Adapted from content at https://code.org/oceans:

> Levels 2-4 (`fishvtrash`, `creaturesvtrashdemo`, `creaturesvtrash`) use a pretrained model provided by the [TensorFlow](https://www.tensorflow.org/) [MobileNet](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md) project. A MobileNet model is a [convolutional neural network](https://developers.google.com/machine-learning/practica/image-classification/convolutional-neural-networks) that has been trained on [ImageNet](http://www.image-net.org/), a dataset of over 14 million images hand-annotated with words such as "balloon" or "strawberry". In order to customize this model with the labeled training data the student generates in this activity, we use a technique called [Transfer Learning](https://en.wikipedia.org/wiki/Transfer_learning). Each image in the training dataset is fed to MobileNet, as pixels, to obtain a list of annotations that are most likely to apply to it. Then, for a new image, we feed it to MobileNet and compare its resulting list of annotations to those from the training dataset. We classify the new image with the same label (such as "fish" or "not fish") as the images from the training set with the most similar results.

> Levels 6-8 (`short`, `long`) use a [Support-Vector Machine](https://en.wikipedia.org/wiki/Support-vector_machine) (SVM). We look at each component of the fish (such as eyes, mouth, body) and assemble all of the metadata for the components (such as number of teeth, body shape) into a vector of numbers for each fish. We use these vectors to train the SVM. Based on the training data, the SVM separates the "space" of all possible fish into two parts, which correspond to the classes we are trying to learn (such as "blue" or "not blue").

## Scenes

The **AI for Oceans** script presents a linear narrative structure.  The app is designed to deliver the interactive levels for this script, one mode at a time, with no need to persist data to the browser or server between each level.

The app itself contains a variety of "scenes", with each mode using a different subset.  The scenes (known as `currentMode` internally) are as follows:

### `loading`

<img width="1512" alt="loading" src="https://user-images.githubusercontent.com/2205926/165215465-9433a9eb-7114-4a50-8dfd-bac8d39e5837.png">


A simple loading screen.

### `words`

<img width="1512" alt="words" src="https://user-images.githubusercontent.com/2205926/165215477-045f46b3-1706-499d-a04e-892dd924157c.png">


Select adjectives for the `short` & `long` modes.

### `train`

<img width="1512" alt="train" src="https://user-images.githubusercontent.com/2205926/165215505-c37975a2-29f5-4126-a19e-0311e113d4d2.png">


The user trains the AI by choosing one of two options (true or false) for each item (fish, non-fish sea creatures, trash).

### `predict`

<img width="1512" alt="predict" src="https://user-images.githubusercontent.com/2205926/165215521-033e4ff4-cda6-475f-8f78-9ceaf91fcaa2.png">

The user watches A.I. (the "bot") categorizing items, one at a time.

### `pond`

<img width="1512" alt="pond-true" src="https://user-images.githubusercontent.com/2205926/165215549-926a481a-87e7-496c-86b3-cedb99a7ec38.png">

<img width="1512" alt="pond-false" src="https://user-images.githubusercontent.com/2205926/165215539-928a1381-ee55-461b-bd13-e3ede88bbe04.png">

The user shows the results of the predictions.  The user can toggle between the matching & non-matching sets.  In short & long, the user can click each item to view additional information about the AI's recognition.

In the `short` and `long` modes, the pond also has a metapanel which can show general information about the ML processing, or, when a fish is selected, specific information about that fish's categorization:

<img width="1512" alt="pond_info" src="https://user-images.githubusercontent.com/2205926/165217317-fa752d7e-1b8c-4755-9014-e6fa19df645b.png">

<img width="1512" alt="pond_fishinfo" src="https://user-images.githubusercontent.com/2205926/165217326-c041e226-0f05-4e9c-87bb-37981b9efc23.png">

## Graphics & UI

The app uses two layers in the DOM.  Underneath, a canvas provides the background and all the sprites.  On top, a regular DOM uses HTML elements to provide the user interface.  The HTML interface is implemented in React.

The app is fully responsive by scaling the canvas and also scaling the size of the HTML elements correspondingly.  The UI simply shrinks to match the underlying canvas.  

## Animation

The animation is designed to be be smooth and frame-rate independent.  

The prediction screen notably renders the progression based on the concept of a "current offset in time", making it possible to pause, and even reverse the animation, as well as adjust its the speed.

All items have a simple "bobbing" animation, using out of sync X and Y offsets cycling in a sine loop.

## The Guide

After initial playtests, we identified a need to slow the pacing of the tutorial and tell a clear story.  The solution we adapted was pop-up text boxes with "typing" text, reminiscent of old-school computer games.  

"The Guide" is the implementation of this solution, and was designed to be a simple but flexible system that allowed us to add a variety of text for every step and situation encountered in the tutorial.

Each piece of Guide text is declared, along with the app state needed for it to show, which can even include code for more expressiveness.  

See the implementation at https://github.com/code-dot-org/ml-activities/blob/main/src/oceans/models/guide.js

This simple system enabled the team to add a detailed narrative voice to the script, and allowed a variety of team members to contribute text.

# Additional information

## Common operations

The documentation for common operations for AI Lab is comprehensive and should apply to this project too: https://github.com/code-dot-org/ml-playground#common-operations


## Getting started

Steps to get up and running:

```
git clone git@github.com:code-dot-org/ml-activities.git
cd ml-activities
nvm install
nvm use
npm install -g yarn
yarn
yarn start
```

At this point the app will be running at [http://localhost:8080](http://localhost:8080) with live-reloading on file changes.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/code-dot-org/ml-activities)

### Integration with local [code-dot-org repo](https://github.com/code-dot-org/code-dot-org)

Similar to https://github.com/code-dot-org/dance-party, ml-activities is built from a small repo as an app which is then used by the code.org dashboard to run individual levels in a script.

If you want to make changes locally in ml-activities and have them show up in your apps build, do the following:

- In the ml-activities root directory `yarn link`
- In the code-dot-org apps/ directory `yarn link @code-dot-org/ml-activities`
This will set up a symlink in apps/node_modules/@code-dot-org to point at your local changes. Run `yarn build` in ml-activities, and then the code-dot-org apps build should pick up the changes (generated in ml-activities' `dist/`) next time it occurs (including in already-running `yarn start` build in code-dot-org).
  - Note that ml-activities' `yarn start` can be left running when `yarn build` is run.  But a new invocation of `yarn start` will intentionally clear the `dist/` directory populated by `yarn build` to ensure we don't have outdated assets left in it.
- If you want to go back to using the published module, in the code-dot-org apps/ directory run `yarn unlink @code-dot-org/ml-activities`.  You'll be given additional instructions on how to force the module to be rebuilt after that.

## Adding new fish components
All fish components live in `public/images/fish` in their respective folders (eg bodies live in `body/`). Despite the fact that the fish face right in most of the tutorial, they are built as if they face left in order to simplify the math for the anchor points. This means that all components should be oriented as if the fish is facing left, which might require flopping any new assets. After adding the assets, they will need to be added to `src/utils/fishData.js`. `bin/determineKnnData.js` will output some of the lines that will be needed in `fishData`.

All components can define `exclusions`, which are modes that the component won't be used in. Components appear in all modes by default.

Some components need more configuration:

### Bodies
Bodies need an anchor point for the body then all of the other components, relative to the bounds of the body image. A face anchor point is used for both the eyes and the mouth. The eyes and mouth are arranged with respect to each other and the defined anchor point. The tail Y anchor point is set from where the center of the component should be.

### Dorsal fin
Some dorsal fins define an x-adjustment to shift the anchor point. This is useful for dorsal fins that might look odd is not positioned correctly (eg symmetical).

## I18n
By default, this tutorial is in English. The strings live at i18n/oceans.json and should not be moved without corresponding changes to the I18n pipeline in `code-dot-org`. Translations can be passed into the app using the `i18n` param. If any translations are missing, the English string will be used as a default. This also means that adding a new string is safe and does not require any further steps.

## Machine Learning algorithms
We currently have support for two machine learning algorithms: k nearest neighbor (KNN) and support vector machine (SVM). We also have a mobilenet model that is saved at `src/oceans/model.json` (it's saved here to avoid a call to googleapis.com).
