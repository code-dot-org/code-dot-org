import React from 'react';
import * as storybook from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';
import addStoriesGroup from 'react-storybook-addon-add-stories-group';
import {setExternalGlobals, setupLocale} from '../test/util/testUtils';
setExternalGlobals();

function addStyleguideExamples(subcomponent) {
  if (subcomponent && subcomponent.styleGuideExamples) {
    subcomponent.styleGuideExamples(storybook);
  }
}

const styles = {
  centeredStory: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

function loadStories() {
  require('./about');
  require('./colors');

  var context = require.context("../src/", true, /\.jsx$/);
  context.keys().forEach(key => {
    var component;
    try {
      component = context(key);
    } catch (e) {
      console.error("failed to load", key, e);
    }
    var path = key.slice(2);
    if (component) {
      addStyleguideExamples(component);
      Object.keys(component).forEach(componentKey => {
        var subcomponent = component[componentKey];
        addStyleguideExamples(subcomponent);
      });
    }
  });
}

function Centered({children}) {
  return <div style={styles.centeredStory}>{children}</div>;
}

storybook.setAddon(infoAddon);
storybook.setAddon(addStoriesGroup);
storybook.addDecorator(story => {
  var rendered = story();
  return (
    <Centered>{rendered}</Centered>
  );
});
storybook.configure(loadStories, module);
