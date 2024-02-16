# Storybook

We use [Storybook](https://storybook.js.org/) to generate a UI component style guide that you can use to discover what components are available to reuse as you build new features. You can also use the style guide to more easily develop new components without having to run all of code.org.

To view the style guide, run:

```bash
yarn storybook
```

and browse to http://localhost:9001/.

## Adding Stories

You can add stories for a component (or set of components) by creating a `*.story.jsx` file in any directory within `apps/src/` and adding code like the following:

```javascript
// MyComponent.story.jsx
import React from 'react';
import MyComponent from '@cdo/apps/templates/MyComponent';

export default {
  title: 'MyComponent',
  component: MyComponent
};

//
// TEMPLATE
//

const Template = args => <MyComponent {...args} />;

//
// STORIES
//

export const FirstStory = Template.bind({});
FirstStory.args = {
  myProp: 'first!'
};

export const SecondStory = Template.bind({});
SecondStory.args = {
  myProp: 'second!'
};
```

This file should be in the same directory as the component it describes.

Read more at ["How to write stories"](https://storybook.js.org/docs/react/writing-stories/introduction) and [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf) in the Storybook documentation.

## Running Stories as Unit Tests

We also have a [test harness](../test/storybook-tests.js) that runs Storybook stories as unit tests, making sure every story can be rendered without error.

To run these tests, run

```bash
yarn test:storybook
```

## Static Style Guide

A static version of the style guide is hosted at https://code-dot-org.github.io/cdo-styleguide/
