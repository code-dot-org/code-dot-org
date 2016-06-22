import React from 'react';
import * as storybook from '@kadira/storybook';
import centered from '@kadira/react-storybook-decorator-centered';
import infoAddon from '@kadira/react-storybook-addon-info';
import addStoriesGroup from 'react-storybook-addon-add-stories-group';
import {setExternalGlobals, setupLocale} from '../test/util/testUtils';
import color from '../src/color';
setExternalGlobals();

function addStyleguideExamples(subcomponent) {
  if (subcomponent && subcomponent.styleGuideExamples) {
    subcomponent.styleGuideExamples(
      storybook,
      {centered}
    );
  }
}

function loadStories() {
  storybook
    .storiesOf('Colors', module)
    .add('yay', () => (
      <div>
        <h2>Colors</h2>
        <p>
          These are the standard colors available in SCSS and javascript.
        </p>
        <p>
          JavaScript usage is as follows:
        </p>
        <pre>
          {`import colors from '@cdo/apps/colors';
console.log("the hex value for purple is:", colors.purple);`}
        </pre>
        {Object.keys(color).map(colorKey => (
           <div key={colorKey} style={{display: 'inline-block',
                                       whiteSpace: 'nowrap',
                                       width: '33%',}}>
             <div style={{display: 'inline-block',
                          border: '1px solid black',
                          width: 50,
                          height: 50,
                          backgroundColor: color[colorKey]}}/>
             <div style={{display: 'inline-block',
                          position: 'relative',
                          bottom: 12.5,
                          paddingLeft: 10,}}>
               <div>{colorKey}</div>
               <div>{color[colorKey]}</div>
             </div>
           </div>
         ))}
      </div>
    ));

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

storybook.setAddon(infoAddon);
storybook.setAddon(addStoriesGroup);
storybook.addDecorator(centered);
storybook.configure(loadStories, module);
