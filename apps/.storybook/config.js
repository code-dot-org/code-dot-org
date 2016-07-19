import React from 'react';
import * as storybook from '@kadira/storybook';
import infoAddon from '@kadira/react-storybook-addon-info';
import Node from '@kadira/react-storybook-addon-info/dist/components/Node';
import {Pre} from '@kadira/react-storybook-addon-info/dist/components/markdown/code';
import addStoriesGroup from 'react-storybook-addon-add-stories-group';

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
  deprecatedStory: {
    width: '100%',
    height: '100vh',
    paddingLeft: 50,
    paddingRight: 50,
  },
  deprecatedStoryHeader: {
    color: 'red',
    textAlign: 'center',
  },
  deprecatedImg: {
    float: 'right',
  },
};


const storybookWrapper = Object.create(storybook);
storybookWrapper.deprecatedStoriesOf = (name, module, options) => {
  const defaultDeprecationReason = `No reason specified. You can pass a third argument
                                    to depcreatedStoriesOf() with a reason`;
  return storybook
    .storiesOf(name + ' (Deprecated)', module)
    .add('DEPRECATED', () => (
      <div style={styles.deprecatedStory}>
        <h1 style={styles.deprecatedStoryHeader}>
          !! THIS COMPONENT HAS BEEN DEPRECATED !!
        </h1>
        <img style={styles.deprecatedImg}
             src="https://cdn.meme.am/instances/500x/62160477.jpg"/>
        <dl>
          <dt><strong>reason:</strong></dt>
          <dd>{options && options.reason || defaultDeprecationReason}</dd>
          <dt><strong>replacement:</strong></dt>
          <dd>
            {options && options.replacement &&
             <a href="#" onClick={storybook.linkTo(options.replacement)}>
               {`<${options.replacement}>`}
             </a>}
          </dd>
        </dl>
      </div>
    ));
};

function addStyleguideExamples(subcomponent) {
  if (subcomponent && subcomponent.styleGuideExamples) {
    subcomponent.styleGuideExamples(storybookWrapper);
  }
}

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
