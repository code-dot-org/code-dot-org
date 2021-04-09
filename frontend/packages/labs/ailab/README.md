# ml-playground

This is the repo for AI Lab from Code.org.

Like the [Dance Party](https://github.com/code-dot-org/dance-party) and [AI for Oceans](https://github.com/code-dot-org/ml-activities) repos, it is a standalone repo that is published and consumed by the [main repo](https://github.com/code-dot-org/code-dot-org).

AI Lab is a highly configurable environment providing a student experience for doing the following:

- loading tabular data (from a pre-loaded CSV with JSON metadata, or from a user-uploaded CSV)
- choosing which column to predict (the label)
- choosing which column(s) to use for the prediction (the features)
- handling both categorical and continuous (numerical) columns
- viewing per-column graphs and metadata
- viewing custom [CrossTab](https://github.com/code-dot-org/ml-playground/pull/62) tables for comparing categorical columns
- viewing scatter plot graphs for comparing continuous columns
- using SVM or KNN classification or KNN regression to train a model
- choosing the subset of data to reserve for validation
- measuring accuracy of the resulting trained model using reserved data
- using the trained model by doing predictions
- saving the trained model to the server for use in App Lab

It can be run standalone for more rapid development, though its ultimate destination is to appear in [Code Studio](https://studio.code.org/).  When run standalone, it does not have all of the styling of Code Studio.  It also calls stub functions for completion, saving a trained model, and indicating which [Dynamic](https://github.com/code-dot-org/code-dot-org/pull/39384) [Instruction](https://github.com/code-dot-org/ml-playground/pull/97) should be shown.  The standalone runtime does have a dropdown for selecting which set of level parameters are used, in lieu of a level providing these parameters, and it also shows the current Dynamic Instruction identifier.

## Common operations

### First time:

```
git clone git@github.com:code-dot-org/ml-playground.git
cd ml-playground
nvm install
nvm use
yarn install
yarn start
```

The app will be running at http://localhost:8080.

### Running a local standalone server

Borrowing one step from above:

```
yarn start
```

The app will be running at http://localhost:8080.

### First time integration with local Code Studio

In this repo:

```
yarn link
```

In main repo's `apps/` directory:

```
yarn link @code-dot-org/ml-playground
```

This will set up a symlink in main repo's `apps/node_modules/` to point at your local changes. 

Run 

```
yarn run build
```

in this repo, and then the main repo's `apps` build should pick the changes up next time it builds.

If you are running `yarn start` for continuous builds in the main repo, it will pick up the changes once the build in this repo has completed.


### Building changes for a local Code Studio
In main repo:

``` 
bin/dashboard-server 
``` 

In main repo's `apps/` directory, run 
``` 
yarn start 
```

If you see an error, run `yarn` before running `yarn start` again.

In this repo:
```
yarn run build
```

Then the main repo's `apps` build will pick up changes. 

See ML-playground changes at http://localhost-studio.code.org:3000/s/allthethings/stage/43/puzzle/1.

Note that running `yarn start` will erase this build, and so for now it seems best to alternate between using `yarn start` for testing the standalone build, and using `yarn run build` to make a single build for consumption by the main repo.

### Publishing a new version

Once we want the official main repo build to get the latest updates from this repo, we need to publish the changes.

In this repo, modify `package.json` with the incremented version number.

Then produce a build:

```
npm run build
```

Then publish the build, skipping the option to adjust the build version:

```
yarn publish
```

Then commit the changed `package.json` for posterity.

In the main repo, modify `package.json` to use the new version of `ml-playground`.

Pick up the new version:

```
yarn
```

Then commit the changed `package.json` and `yarn.lock` files so that the official build pipeline uses the new version.

### Verify symlink exists between code-dot-org repo and ML playground
In main repo: 
``` 
 cd apps/node_modules/@code-dot-org 
 ls -l 
```
In the output, you should see something like this: `ml-playground -> ../../../../../.config/yarn/link/@code-dot-org/ml-playground`
