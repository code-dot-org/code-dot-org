Component Library (Design System components)
=============================================
This is a collection of Design System React components that are used across our apps.
We store components in `src/componentLibrary` folder(the one where this README.md is located) for now,
but once we'll be ready - we'll be moving design system components to
[DSCO_ repo](https://github.com/code-dot-org/dsco_).

The main idea of Design system is that you'll use these components when you'll need to create a new page or update
an existing one, and you'll be able to do it without a designer, because you'll have all the components you need
in one place. In addition to that, we'll have one instance of base components meaning that once we'll want to update
something across the project (e.g. change color scheme of button, or Typography styles), we'll only need to update this
library instead of finding and updating all the exising implementation of needed functionality
(e.g. buttons or typography)


**Note(!):** ``StylizedBaseDialog`` and ``TabView`` are in this folder, but they **are not a part of design system**.


**Design system** is a work in progress, so some components might be missing, some might be not fully implemented. 
To give a better understanding of components state/status and which one can and can not be used we're introducing
a complete ``production-ready checklist`` and different ``statuses`` that'll be applicable to every new and
existing Design System component.


### Production-ready Checklist:
* implementation of component approved by design team; (Waiting for public storybook to be able to do that)
* has storybook, covered with stories and documentation; (in progress)
* has tests: test every prop, every state and every interaction that's js related (todo)
* passes accessibility checks (TBD)

### Possible component Statuses: 
* ```WIP``` - work in progress, not ready for usage in production;
* ```Ready for dev``` - component is ready for development, has most of the functionality implemented but might not yet 
pass all production ready checklist criteria or might have some visual changes;
* ```Stable``` - component is ready for production, passes all production ready checklist criteria;
* ```DEPRECATED``` - component is deprecated, should not be used in new pages, but can be used in existing ones;

To keep of those two metrics simply go to component and check the top of it's ```JSDoc comment```
or open ```storybook's docs tab```.

Here's an example/template for better understanding:
```jsx
/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✘) has tests: test every prop, every state and every interaction that's js related;
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 * Design System: Some Component.
 * Some desctription goes here...
 */
const SomeComponent = props => {
    // ...
}
```


This information should always be on the top of the component's documentation. Once component status is set
to ```Stable``` or ```DEPRECATED``` you can remove ``` * ### Production-ready Checklist```. Example:

```jsx
/**
 * ###  Status: ```Stable```
 * Design System: Some Component.
 * Some desctription goes here...
 */
const SomeComponent = props => {
    // ...
}
```


### Documentation
 We're using JSDocs and Storybook for documenting components mostly. We also do have README.md, and CHANGELOG.md
 files for every component, where you can see some additional information.

### Testing
(To be added)

### Accessibility
Full accessibility checklist is following:
 * A keyboard user can access full functionality of a component (with props required/suggested as needed to make this happen)
 * A mouse user can access full functionality of a component (with props required/suggested as needed to make this happen)
 * A voiceover user can access full functionality of a component (with props required/suggested as needed to make this happen)**
 * We have sufficient color contrast according to the [Advanced Perceptual Contrast Algorithm](http://www.myndex.com/APCA) (APCA).
 * Site views and behaves as expected for a RTL user
 * Styling accommodates differently-sized strings for non-English users

We do have a set of checks in storybook that might help you with some of those steps. (e.g. color contrast check)
To see them - visit storybook's 'devTools' Accessibility tab.
![alt text](https://user-images.githubusercontent.com/22244040/264050042-dae78e34-5b7c-49ef-b53f-4b5dd5986845.png)


If you're interested in getting more info on accessibility topic - here's a
[discussion notes doc on accessibility checklist](https://docs.google.com/document/d/1Tdx33n5T-cm86jcj2osN_6enCvQ6DS0plVtk2901Si4/edit)
for the whole code-dot-org.
