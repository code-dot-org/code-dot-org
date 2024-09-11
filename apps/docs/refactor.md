# Refactoring Code.org javascript

The code base has been around for a while and a lot has changed. While there is
still a lot of spaghetti, it's at least now in a place where we have the
opportunity to refactor the code without changing build systems or doing any other
super complicated thing.

## The case for refactoring

code.org has multiple websites, each of which have their own set of features
that rely on rich client side javascript. Most of the javascript for these
different sites has ended up in the `apps/src` directory, whether or not they
relate to or depend on each other. For historical reasons, this code is not
organized well, which causes a number of problems for us:

- it is difficult to understand the execution flow across module bounderies
  without resorting to step debugging
- it is difficult to understand how modules could be efficiently broken up into
  different bundles in a way that reduces page load times
- it is difficult for newcomers to understand how the code base is organized
  (it's not!)
- it is difficult to figure out how/where to add code in a way that doesn't add
  to the spaghetti that is already there

The goal of refactoring would be to make all of the above much less difficult
and time consuming.

## Key challenges to refactoring

Our codebase has morphed over time to use a number of different
strategies/libraries/frameworks for managing state, business logic, and ui. If
we were using a single strategy/library/framework, it would be easier to come up
with a filesystem and module architecture that followed the best practices of
that framework.

At the moment, we have collectively decided to invest heavily in adopting react
for the UI, and redux for the application state. Unfortunately, given the size
of our codebase, it's unrealistic to deprecate or rewrite all the code that was
written using jquery, ejs templates, and raw javascript. On top of that, we use
a number of third party libraries (piskel, blockly, etc.) for large parts of our
product, and these libraries don't necessarily use react or redux.

We also have a lot of code that doesn't really involve UI or state, but which
provides core functionality for our product, such as the JS interpreter.
react/redux architecture best practices aren't opinionated about
these types of libraries and so it's up to us to figure out how to organize
them.

Finally, we have a number of sub-products which are only tangentially related to
each other, such as our PD workshop management dashboard, various standalone
"widgets" that illustrate different CS concepts, the tutorial explorer, and
more. These all live in the same code bases, making it easy for them to share
code (which is good), but also easy for them to become unintentionally entangled
with each other (which is bad).

## Definitions

The first step to refactoring is to define a common language that we can use to
talk about all the different parts of our system.

**sites**

At the highest level, our product is a collection of different multi-page
websites hosted at a number of different domain names. We can call these
"sites". Thus, the code.org product consists of the following "sites": code.org,
studio.code.org, hourofcode.org, csedweek.org, etc.

While these sites may talk to the same backend databases, point to the same
application servers, share authentication tokens, and reuse the same code, from
the point of view of the front-end code base, these are distinct sites.

While noting what types of resources these sites might share, it's important to
also note which resources they absolutely do not share: client side browser
resource caches (assuming the resources are being loaded from the same domain
name as the site), state stored across page loads in html5 local storage, single
domain cookies, and probably some other stuff.

**pages**

One level below sites are pages. A single site typically consists of multiple
pages with different url patterns. Each page might provide a distinct set of
features to a distinct set of users.

The really important aspect of a "page" is that it represents the outermost
scope of our javascript runtime. That means any javascript being executed on
that page is running in a shared memory environment where arbitrary values can
be stored on the window object and be accessed by other javascript running on
the same page. However, when the user moves to a different page, any state being
maintained within that page's scope is wiped clean.

**entry point**

In theory, each page should have exactly one javascript file loaded on it (via a
`<script>` tag) which represents the primary point of entry into our javascript
code base. The javascript build system is responsible for aggregating all the
necessary code into this single javascript file that is needed to setup
everything on the page.

Note 1: The build system can produce auxiliary files that must be loaded on the
page for the "entry point" to work. These other files are not "entry points",
but rather "common chunks" of shared code that are only separated to optimize
page load times. These "common chunks" don't actually do anything except provide
functionality that can be optionally used by the entry point.

Note 2: We are pretty far from having a single "entry point" per page, but this
is really what we should be striving towards.

The other critical aspect of an entry point is that it should explicitly "own"
all the application state that is needed to render and update the page. In the
event that any of the entry point's dependencies need to access or modify the
application state owned by the entry point, it is up to the entry point to
explicitly pass that state to its dependencies, along with mutators for
modifying that state.

**library**

Each entry point can make use of numerous "libraries" to setup and run the
page. A library is just a collection of related code that provides functionality
at an arbitary level of abstraction. This is the broadest and vaguest term that
will be covered in our list of definitions.

Libraries are not responsible for owning shared application state. Libraries may
have and maintain their own internal state, but this state should be kept
strictly within the library's scope.

It's likewise up to the library to support or not support a multi-instance state
system. i.e. libraries can choose to act like singletons, where only one
"instance" of the library can be in play on the page at a time, or they can act
like classes which can be instantiated multiple times.

---

So far, these terms are generic for any web product with a similar structure to
ours. From here on, we'll dive into some more specific language for our stuff.

---

## Library Types

Since "library" is such a broad/vague/overloaded term, it doesn't really help us
decide how to arrange our code base into distinct library units. For that we
need to further subdivide the concept of a library into a couple of "library
types". But first let's talk about what good library division looks like.

When we think about how to divide our codebase into a collection of smaller
libraries, it's important to consider cohesion, coupling, and encapsulation:

- Cohesion means all the code in a library is related to the other code in the
  library, i.e. you don't combine code with completely orthogonal concerns into
  the same library.
- Coupling refers to implicit dependencies between seemingly unrelated peices of
  code. It is the primary source of spaghetti, and is something we should strive
  to minimize in our code base. A great example of coupling is having one module
  interact directly with the DOM that another unrelated module created.
- Encapsulation refers to the way in which data and functionality are (or are
  not) exposed outside a given library. Libraries should expose their data and
  functionality via a well-defined API that dictates how libraries can interact
  with each other.

In defining library bounderies, we should strive for a high degree of cohesion
within a library, little if any implicit coupling with other libraries, and
strong encapsulation.

Because of the way our product is currently implemented, and because of how web
technologies work at a fundamental level, there are limitations to how
encapsulated, cohesive, and uncoupled we can make various libraries. For
example, any code that renders directly to the DOM and relies on that DOM
remaining in a particular state, is fundamentally not encapsulated because any
other code on the page can do whatever it wants with that DOM at any
time. Libraries like react and redux try to solve this by encouraging specific
coding patterns that limit the surface area of unencapsulated code, but it is up
to individual developers to actually stick to those patterns when writing code.

For instances where react and redux do not provide sufficiently well defined
patterns for our needs, we need to come up with our own patterns that reduce our
exposure to unencapsulated spaghetti code.

Getting back to "library types", I think there are two different library types
for which we need to establish well defined patterns.

1. **feature library** - This is a library that provide some meaty feature
   of a page. It is characterized by having any one of the following attributes:

   - maintains UI represented in the DOM (i.e. calls to ReactDOM.render(), or
     use of jQuery to manipulate the DOM)
   - interacts with a remote, stateful service (i.e. ajax calls that generate
     writes to a database)
   - uses or provides shared application state (e.g. Redux)

   Some examples of "feature libraries" in our code base today would be the code
   found in `src/applab`, `src/netsim`, and `src/flappy`. Note however that
   these directories also contain `main.js` files which strictly speaking are
   not part of the "library" but are actually entry points that get loaded on a
   particular html page.

2. **capsule library** - This is a library that is wholly encapsulated and
   decoupled, and which therefore:

   - does not maintain any UI represented in the DOM (react components are OK, but
     calls to ReactDOM.render() are not; creating DOM nodes through other means
     is ok, but attaching them to the document is not.)
   - does not interact with remote, stateful services (ajax calls to read-only
     services could be OK)
   - does not use or provide shared application state (except where that state
     is explicitly passed from above)

   Some examples of "capsule libraries" in our code base would be
   `src/MusicController.js`, `src/dom.js`, `src/Sounds.js`.

## Capsule Library

### Capsule Library Pattern

In the case of a relatively simple capsule library that consists of only one
file, the pattern is pretty simple:

- Export functions and classes that other libraries are allowed to use. Do not
  change the interfaces of these functions/classes in a way that is not
  backwards compatible without updating all the callsites.
- If the library works with internal state, encapsulate that state into a class
  that must be instantiated by the calling code.
- If the library works with internal state, but only supports a singleton
  instance, only export the singleton instance and not the backing class. Note
  that you don't even need to have a backing class to have a library which acts
  as a singleton. It's fine to just enclose data within a library's internal
  scope.

For more complicated capsule libraries whose code is spread across multiple
files the pattern is only a bit more involved:

- Put all the library files into a directory, and expose a single index.js file
  which exports the functions/classes that other libraries are allowed to
  use. Calling code imports from the index.js file only. This makes dependency
  graphs easier to read.

### Capsule Library Rules

The rules for capsule libraries are also straightforward:

- Do not depend on feature libraries
- Do not read from or write to the global window object (accessing standard browser
  APIs is OK)
- Do not reference DOM nodes by ID or css selectors that are not passed in to
  the library explicitly.

## Feature Library

Feature libraries require more discipline to avoid coupling and spaghetti code,
since they must inherently interact with some form of global state at some
point. But if we are careful and consistently apply a sensible pattern for
writing feature libraries, we can keep things clean and manageable.

### Feature Library Pattern

The primary goal of the feature library pattern is to make it really clear where
and how the library interacts with shared state or remote services.

#### Exposing/Providing Shared State

Shared application state should be managed by redux. Since there can only be one
redux store on a page, while there can be multiple features on a page, feature
libraries are not allowed to create their own redux store. However, they can
have their own actions and reducers which operate on a well defined portion of
the global redux state tree. https://github.com/erikras/ducks-modular-redux
describes one pattern for doing this, which we will riff on.

Feature libraries that expose shared redux state should have the following
directory structure:

```
src/
  <feature-name>/
    index.js
    redux/
      reducer.js
      actionTypes.js
      actionCreators.js
      selectors.js
```

In this hypothetical feature, we expose the state and actions for a stepper
feature for use in other libraries. In order to keep encapsulation high, we want
to only expose the action types, action creators, and selectors that other
libraries need to use, while keeping the rest more "private" to our own
library. Also, it's important to consider that other code which uses this feature
library should not have to know about the shape of the state provided by the
feature. Likewise, the feature should not have to know how its state gets
stored in the global redux state tree.

Here is how the above files might look if we wanted to expose only step
incrementation, but not step decrementation.

**`src/stepper/redux/actionTypes.js`**

Action types are prefixed with the name of the feature to avoid collisions with
other libraries and their reducers.

```js
export const INCREMENT_STEP = 'stepper/INCREMENT_STEP';
export const DECREMENT_STEP = 'stepper/DECREMENT_STEP';
```

**`src/stepper/redux/reducer.js`**

The reducer for the feature library should operate on a subtree of the global
state tree, rather than on the entire state tree. Note that this library acts
like a singleton in the sense that there is only one corresponding state object
for the library on the page at any given time.

```js
import * as actionTypes from './actionTypes';

export default reducer(state={step: 1}, action) {
  switch (action.type) {
    case actionTypes.INCREMENT_STEP:
      return {step: state.step + 1};
    case actionTypes.DECREMENT_STEP:
      return {step: state.step - 1};
    default:
      return state;
  }
}
```

**`src/stepper/redux/actionCreators.js`**

Action creators should make sure to generate actions with types that are
globally unique on the page.

```js
import * as actionTypes from './actionTypes';

export function incrementStep() {
  return {type: actionTypes.INCREMENT_STEP};
}

export function decrementStep() {
  return {type: actionTypes.DECREMENT_STEP};
}
```

**`src/stepper/redux/selectors.js`**

Selector functions for the feature must be "configured" before they can be used
so that they know how to access the part of the global state tree with the data
they are interested in. This is done using the `setRootSelector` function.

```js
let getRoot = () =>
  throw new Error('rootSelector not set. Did you forget to call configure?');

export function setRootSelector(rootSelector) {
  getRoot = rootSelector;
}

export function getStep(state) {
  return getRoot(state).step;
}
```

**`src/stepper/index.js`**

The feature library's `index.js` file exposes just the action types, action
creators, and selectors that it expects other libraries to use. This makes it
easier to explicitly limit how a library can be used, reducing the chance of
unintentional coupling and spaghetti code.

`index.js` also exposes a `configure` function that is used to inject the root
selector into the feature library from above, which removes coupling between the
feature library and the exact format of the global redux store.

```js
import reducer from './redux/reducer';
import {INCREMENT_STEP} from './redux/actionTypes';
import {incrementStep} from './redux/actionCreators';
import {getStep, setRootSelector} from './redux/selectors';

export reducer;
export const actionTypes = {INCREMENT_STEP}
export const actions = {incrementStep};
export const selectors = {getStep};

export function configure(config) {
  setRootSelector(config.getState);
}
```

An entry point which uses this feature library (and the state that it exposes)
on a given page would then have code like this:

**`src/entry-points/some-page.js`**

```js

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {connect, Provider} from 'react-redux';
import {* as stepper} from 'stepper';

const store = createStore(
  combineReducers({stepperState: stepper.reducer})
);

// tell the stepper how to access its portion of the global state tree.
stepper.configure({getState: state => state.stepperState});

const StepBanner = connect(
  state => ({step: stepper.selectors.getStep(state)})
)(props => <div>You are on step {props.step}</div>);

ReactDOM.render(
  <Provider store={store}>
    <StepBanner />
  </Provider>
);
```

#### Exposing/Providing Connected React Components

Features that maintain shared application state usually do so because they also
render/expose connected react components that work with that state. Continuing
with our stepper library example, if we wanted to export a connected
`<Incrementor />` component, we would write it like this:

**`src/stepper/components/Incrementor.jsx`**

```jsx
import {incrementStep} from '../redux/actionCreators';
import {getStep} from '../redux/selectors';

connect(state => ({step: getStep(state)}), {incrementStep})(props => (
  <button onClick={props.incrementStep}>Increment to {props.step + 1}</button>
));
```

and the `index.js` file would be updated to explicitly export this component:

**`src/stepper/index.js`**

```js
import Incrementor from './components/Incrementor';
export Incrementor;
```

#### Using Shared State in a Feature Library

In some circumstances, feature libraries may need to access shared state that is
provided by another feature library. To make our discussion more concrete, let's
assume that our stepper feature library needs to check if a user is logged in
before allowing the step to be incremented. The login state of the application
is provided by an authentication feature library.

If the stepper library imports selectors directly from the authentication
library to access the logged in state, then there is an implicit dependency
created between the stepper library and the entry point that uses it because it
assumes that at some point the authentication library has been configured
properly by the entry point. This would be unintentional coupling.

Instead, the entry point should be responsible for passing the configured
authentication selectors directly to the stepper library via its `configure`
function. Here is how that might look:

**`src/entry-points/some-page.js`**
Now our entry point has to configure both the `stepper` and the `auth`
libraries and manage how they access each other's shared state.

```js
import {createStore, combineReducers} from 'redux';
import {* as auth} from '../auth';
import {* as stepper} from '../stepper';

const store = createStore(
  combineReducers({
    authState: auth.reducer,
    stepperState: stepper.reducer
  })
);

auth.configure({
  getState: state => state.authState,
});
stepper.configure({
  getState: state => state.stepperState,
  authSelectors: auth.selectors,
});
```

**`src/stepper/index.js`**

Meanwhile, the configure function of our `stepper` library would now accept a
set of auth selectors. It doesn't need to know where these selectors came from,
which has a nice side effect of making the `stepper` library easier to test with
a "fake" set of auth selectors.

```js
import reducer from './redux/reducer';
import {INCREMENT_STEP} from './redux/actionTypes';
import {incrementStep, setAuthSelector} from './redux/actionCreators';
import {getStep, setRootSelector} from './redux/selectors';

export reducer;
export const actionTypes = {INCREMENT_STEP}
export const actions = {incrementStep};
export const selectors = {getStep};

export function configure(config) {
  setRootSelector(config.getState);
  setAuthSelector(config.authSelectors);
}
```

**`src/stepper/redux/actionCreators.js`**

Now we can update our action creators to check the login state before actually
dispatching the action.

```js
import * as actionTypes from './actionTypes';

let authSelectors = {
  isLoggedIn: () => throw new Error("Auth selectors not configured.");
};

export function setAuthSelectors(newAuthSelectors) {
  authSelectors = newAuthSelectors;
}

export function incrementStep() {
  return (dispatch, getState) => {
    if (authSelectors.isLoggedIn(getState())) {
      dispatch({type: actionTypes.INCREMENT_STEP});
    } else {
      throw new Error("You can't increment a step without being logged in!");
    }
  }
}

export function decrementStep() {
  return {type: actionTypes.DECREMENT_STEP}
}
```

### Feature Library Rules

In order to maintain some sanity, there are a few important rules that govern
what feature libraries cannot do:

- do not create redux stores
- do not reference DOM nodes by ID or css selectors except for those DOM nodes
  that were created and rendered to the DOM by the library.
- do not depend directly on other feature libraries unless you are reponsible
  for configuring them

## Further Reading

If all this sounds a bit confusing to you, read
http://jaysoo.ca/2016/02/28/organizing-redux-application/, which is a more
concise explanation of basically the same thing as is proposed in this document.

# The Actual Plan

While having patterns for capsule and feature libraries is helpful, we need to
go one step further to figure out how to actually execute this refactoring.

## Directory Hierarchy

The first step is determining a sensible directory structure that organizes code
based on the various patterns we want to use, and based on the various problem
domains that our code base covers.

Here is a strawman to discuss:

```
src/
  sites/   <--- resusable libraries do not belong in here
    <site-name>/
      pages/
        <page-name>.js
        <page-name-with-multiple-entry-points>/
          <entry-point-name>.js
          <other-entry-point-name>.js
      init/
        redux.js
        constants.js
        other-site-specific-config-shared-across-entry-points.js
  lib/   <--- all reusable libraries go in here
    kits/   <--- Big feature libraries that are only referenced from entry points
      <kit-name>/
        <kit-name>.js
        redux.js
        ui/  <--- capsules that generate DOM specific to this kit
        util/  <--- capsules specific to this kit
    tools/   <--- Small feature libraries that can be used by other feature libraries
      <tool-name>/
        <tool-name>.js
        redux.js
        ui/
        util/
    ui/   <--- capsule libraries that generate DOM
      <ReactComponentName>.jsx
    util/  <--- capsule libraries that do not generate DOM
      <stateless-util-library>.js
    third-party/
```

And here is a list of ordered steps to take that will move us in this direction:

1. Move all entry points into `sites` directory structure [easy]
2. Move initialization code into `sites` directory structure [medium]
3. Move "leaf nodes" of depdency graph into `lib/util` directory [easy]
4. Rename templates directory to `lib/ui` [easy]
5. Remove cycles from our dependency graph [hard]
6. Move applab/gamelab/weblab/maze/studio/etc into `lib/kits` directory [medium]
7. Move all the other stateless utility modules into `lib/util` [easy]
8. Move all the other stateful modules into `code-studio` directory [medium]
9. Refactor entry points to inject dependent modules into feature libraries [hard]
10. [...]
11. profit!

The [easy] stuff should take no more than one developer day to do.

The [medium] stuff should take a few developer days to do.

The [hard] stuff will probably take at least a developer week to do.

The [...] stuff could take an immeasurable amount of time to do.
