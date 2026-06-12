# @code-dot-org/ailab

This package is AI Lab from Code.org.

It lives in this monorepo at `frontend/packages/labs/ailab` and is consumed by the main repo's `apps/` directory (CodeAI Studio). It was previously a standalone, separately-published repo, like [Dance Party](https://github.com/code-dot-org/dance-party) and [AI for Oceans](https://github.com/code-dot-org/ml-activities).

AI Lab is a highly configurable environment providing a student experience for doing the following:

- loading tabular data (from a pre-loaded CSV with JSON metadata, or from a user-uploaded CSV)
- choosing which column to predict (the label)
- choosing which column(s) to use for the prediction (the features)
- handling both categorical and continuous (numerical) columns
- viewing per-column graphs and metadata
- viewing custom [CrossTab](https://github.com/code-dot-org/ml-playground/pull/62) tables for comparing categorical columns
- viewing scatter plot graphs for comparing continuous columns
- using KNN classification or KNN regression to train a model
- choosing the subset of data to reserve for validation
- measuring accuracy of the resulting trained model using reserved data
- using the trained model by doing predictions
- saving the trained model to the server for use in App Lab

It can be run standalone for more rapid development, though its ultimate destination is to appear in [Code Studio](https://studio.code.org/). When run standalone, it does not have all of the styling of Code Studio. It also calls stub functions for completion, saving a trained model, and indicating which [Dynamic](https://github.com/code-dot-org/code-dot-org/pull/39384) [Instruction](https://github.com/code-dot-org/ml-playground/pull/97) should be shown. The standalone runtime does have a dropdown for selecting which set of level parameters are used, in lieu of a level providing these parameters, and it also shows the current Dynamic Instruction identifier.

## Demo recording

https://user-images.githubusercontent.com/2205926/125634349-a30d64f3-6e05-41ac-a2fc-b82ab794b18f.mov

## Design notes

#### Navigation

The app uses a scene-by-scene approach, similar to AI for Oceans. It has centralized logic to handle whether the Previous and Next buttons should show, and separately whether they should be enabled. The app enforces a lot of required user actions simply by not enabling a button until a state has been set. For example, the user can't navigate forward from label selection until they have selected a label.

#### Dynamic Instructions

We wanted to make use of the existing instructions infrastructure provided by the main repo, which has things like text-to-speech support and authoring UI in levelbuilder. But we also wanted a way to provide dynamic instructions tailored to each scene in the app. We experimented with a variety of combinations, but they often led to a busy combination of lengthy instructions (since they were addressing every step in AI Lab) in the regular instruction panel at the top, along with custom instructions below in the AI Lab app area.

The creation of [Dynamic Instructions](https://github.com/code-dot-org/code-dot-org/pull/39384) was the breakthrough that gave us the best of both worlds. They can be authored in levelbuilder, use the existing text-to-speech system, and can also be used outside of AI Lab. They encourage instructions to be written for just the current panel on the screen. (They can also be triggered by other states in the app for specific instructions at those moments in time.) They do not dynamically resize, so the screen below them does not shift around, and they are guaranteed to always be fully readable without needing scrolling. And best of all, they empower curriculum designers to explain what's happening in each level with minimal changes required in the app itself. (That said, adding new Dynamic Instructions for specific states in the app is very easy.)

#### Responsiveness

The app is horizontally responsive, though it doesn't need to collapse all the way to mobile widths because our host site manages the viewport on mobile devices and also enforces landscape viewing.

The app is vertically responsive, and uses flexbox to fill the vertical space with a combination of fixed- and variable-height elements.

#### Adding a dataset

To add a new "pre-canned" dataset to the tool, add three files - `.csv`, `.json`, and `.jpg` - to the `public/datasets/` directory. Then add the dataset to `public/datasets-manifest.json`.

Take care that each column is correctly listed in the `.json` file, and test that it's working in the tool by highlighting each column and ensuring that its metadata shows correctly in the panel on the right.

### Scenes:

#### Select dataset

This is usually the first scene, and can offer selection of both "pre-canned" datasets, which have accompanying metadata, or user-uploaded CSV. The tiles use an art style somewhat consistent with that used elsewhere in our product. There is a fun "grow" animation on tile hover, just to feel a little more interactive, which is reused for the A.I. bot head elsewhere in the app.

#### Data display (label & features)

This scene went through major iteration, before settling on the current implementation. The scene is used twice, once to select a label and again to select features. It tries to achieve a number of objectives:

- it centers the tabular data in the student experience;
- it allows the construction of a statement ("Predict [feature] based on [labels].") which carries across the experience;
- it allows for the exploration of columns and their properties before they are selected.

When selecting a label, the properties panel on the right shows information for the highlighted column:

- a bar graph for categorical data;
- min/max/range for numerical data.

When selecting a feature, it shows the above properties for the highlighted column, but also attempts to show information about the relationship between that column and the previously-selected label:

- a custom CrossTab when both label and feature are categorical data;
- a scatterplot when both label and feature are numerical data.

For student-uploaded CSV files, we attempt to guess the column type based on the type of data detected in the column, but provide a way for the student to override this.

#### Train Model

A.I., the bot from AI for Oceans, is back. Here, we attempt to illustrate the training process, in which a large amount of the original tabular data is given to the bot, row by row. The animation is done by updating the React state 30 times a second to trigger a re-render each time. The scene supports very small datasets, finishing early, as well as larger datasets, fading out after showing a few iterations of the animation.

#### Generate Results

In this scene we attempt to show A.I. generating results, again inspired by the way we presented it in AI for Oceans. Here, the bot is making predictions on rows that were reserved for this purpose: it takes the features and predicts the label for each of those rows. As in the previous scene, it handles both very small and larger datasets.

#### Results

This screen does a few things:

- It shows the result for the most recent set of predictions. That is, it shows the statement ("Predict [feature] based on [labels].") along with the accuracy (which is how well it predicted labels in the previous scene, when comparing those labels against their actual values, since this prediction was done using a reserved set of data from the original tabular data).
- It shows the results of previous sets of predictions, with their respective statements. This way the student can compare statements to see which have the highest "predictive power".
- It lets the student view details of the most recent set of predictions, which shows in a pop-up. This view has a toggle between showing correct and incorrect predictions. In the table, the student can examine each row of reserved data to see how the label's actual value compares to what was predicted.
- The student can "Try it out!" and run their own predictions. The interface here is very similar to what they can see in App Lab once they import the saved model there. The A.I. bot makes a reappearance here, because it's popular!

#### Save Model

The student can fill out the "model card" and then save the model, along with the model card information, to the server. This model can then be imported in App Lab. The model card information is seen in App Lab when previewing the model prior to importing it. [Model cards](https://modelcards.withgoogle.com/about) serve as an accessible reference for an AI model. They allow the student to document decisions. And analyzing model cards in the curriculum helps students to [explore](https://codeorg.medium.com/code-org-curriculum-now-teaches-ai-to-every-student-f4d09895be15) issues of bias and ethics.

#### Model Summary

The student can see a summary of the model that they have just saved. Proceeding from here will go to the next level in the progression.

## Common operations

This package is a workspace in [`frontend/`](../../..); there is no separate clone, `yarn link`, or publish step. Run these from this directory (`frontend/packages/labs/ailab`).

### Running a local standalone server

```
yarn dev
```

The app will be running at http://localhost:5173. This is the standalone runtime described above — it runs without Code Studio's styling, calls stub functions for completion / saving / instructions, and offers a dropdown to choose level parameters.

### Other scripts

```
yarn build       # Vite library build -> dist/
yarn test        # Vitest unit tests
yarn typecheck   # tsc
yarn lint
```

### Integration with local Code Studio

The main repo's `apps/` consumes this package as a [`portal:`](https://yarnpkg.com/protocol/portal) workspace dependency, symlinked into `apps/node_modules/@code-dot-org/ailab` — no `yarn link` needed.

When `apps/` builds (`yarn build`, or `yarn start` for continuous builds), its `script/build-frontend-dependencies.sh` builds this package's `dist/` first, and the apps Gruntfile copies `dist/assets/` (datasets and images) into `build/package/media/skins/ailab/`. To pick up local changes, rebuild this package (`yarn build`); the next `apps` build will use it.

### Verifying the symlink

In the main repo:

```
ls -l apps/node_modules/@code-dot-org/ailab
```

You should see it point at `../../../frontend/packages/labs/ailab`.
