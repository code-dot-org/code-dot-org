[![Build Status](https://travis-ci.org/code-dot-org/ml-activities.svg?branch=master)](https://travis-ci.org/code-dot-org/ml-activities)

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

### Adding new fish components
All fish components live in `public/images/fish` in their respective folders (eg bodies live in `body/`). Despite the fact that the fish face right in most of the tutorial, they are built as if they face left in order to simplify the math for the anchor points. This means that all components should be oriented as if the fish is facing left, which might require flopping any new assets. After adding the assets, they will need to be added to `src/utils/fishData.js`. `bin/determineKnnData.js` will output some of the lines that will be needed in `fishData`. Some components need more configuration:

# Bodies
Bodies need an anchor point for the body then all of the other components, relative to the bounds of the body image.

# Tails 
