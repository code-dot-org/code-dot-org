## Progress

This contains a new progress system that can be used by any **Lab2** lab.  It allows for a level to define a variety of conditions, some of which give the user feedback, and some of which allow the user to continue to the next level.

It was first introduced by Music Lab in https://github.com/code-dot-org/code-dot-org/pull/50596.  Adapted from that PR's description, here are some key features:

- Each level has a set of validation conditions.
- The level designer writes these in JSON, rather than JavaScript, so we have a clean separation between per-level validation conditions and the lab's internal implementation.
- Conditions that aren't recognised are skipped, allowing level designers to add necessary conditions while lab engineers will later add support for them.
- Level designers can provide feedback messages for specific conditions.
- It's essentially the same system as was built for Star Wars in 2015 [here](https://github.com/code-dot-org/code-dot-org/blob/1003ddc2281b4bed5a1d4473c2e4104bafc476f8/apps/src/studio/levels.js#L3261-L3290), and AI for Oceans in 2019 [here](https://github.com/code-dot-org/ml-activities/blob/51eedd101c4fe645a82d7d06bb4dfdc62003e023/src/oceans/models/guide.js).

And here are some architectural details:

- `ProgressManager` manages progress, and is lab-agnostic.
- A lab-specific validator, such as `MusicValidator` in **Music Lab** does lab-specific evaluation of progress. It implements the abstract `Validator` class, and is passed into `ProgressManager`, which knows of nothing more than `Validator`.
- `ConditionsChecker` is a helper class which accumulates satisfied conditions for the current execution of user code, and is used by the lab-specific validator implementation. Other labs might benefit from it, though there are alternate techniques to validate code, such as direct code examination, which don't really need to accumulate satisfied conditions over a period of time.
- For now, the lab loads the progression data and passes it into `ProgressManager` when it instantiates that class. The lab also instantiates the lab-specific validator and gives it access to the components it needs to examine progress.

There is a user-friendly levelbuilder UI for building these validations in a level.  Details in https://github.com/code-dot-org/code-dot-org/pull/53142.

Sample level data from **Music Lab**:
https://github.com/code-dot-org/code-dot-org/blob/1226e19496b69da1e3e9066756979220608ba272/dashboard/config/levels/custom/music/Music%20Level%202.level#L20-L37
