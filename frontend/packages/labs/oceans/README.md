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

# Local integration with https://github.com/code-dot-org/code-dot-org

Similar to https://github.com/code-dot-org/dance-party, ml-activities is built from a small repo as an app which is then used by the code.org dashboard to run individual levels in a script.

If you want to make changes locally in ml-activities and have them show up in your apps build, do the following:

- In the ml-activities root directory `yarn link`
- In the code-dot-org apps/ directory `yarn link @code-dot-org/ml-activities`
This will set up a symlink in apps/node_modules/@code-dot-org to point at your local changes. Run `npm run build` in ml-activities, and then the apps build should pick the changes up next time it builds.
- If you want to go back to using the published module, in the code-dot-org apps/ directory run `yarn unlink @code-dot-org/ml-activities`.  You'll be given additional instructions on how to force the module to be rebuilt after that.
