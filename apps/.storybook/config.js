import React from 'react';
import * as storybook from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';
import Node from '@kadira/react-storybook-addon-info/dist/components/Node';
import {Pre} from '@kadira/react-storybook-addon-info/dist/components/markdown/code';
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
  storyTable: {
    table: {backgroundColor: 'white', tableLayout: 'fixed'},
    row: {border: '1px solid #ccc'},
    cell: {width:'50%', padding: 20},
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

storybook.setAddon({
  addStoryTable(items) {
    let hasDescription = false;
    items.forEach(item => hasDescription = hasDescription || !!item.description);
    this.add(
      'Overview',
      () => (
        <div>
          <table style={styles.storyTable.table}>
            <thead>
              <tr>
                <th>Version</th>
                <th>Rendered</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                 <tr style={styles.storyTable.row} key={index}>
                   <td style={styles.storyTable.cell}>
                     <strong>
                       {item.name}
                     </strong>
                     <p>
                       {item.description || ''}
                     </p>
                     <Pre>
                       <Node depth={0} node={item.story()}/>
                     </Pre>
                   </td>
                   <td style={styles.storyTable.cell}>{item.story()}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      )
    );
    items.forEach(item => this.add(item.name, item.story));
  }
});

storybook.setAddon(infoAddon);
storybook.setAddon(addStoriesGroup);
storybook.addDecorator(story => {
  var rendered = story();
  return (
    <Centered>{rendered}</Centered>
  );
});
storybook.configure(loadStories, module);
