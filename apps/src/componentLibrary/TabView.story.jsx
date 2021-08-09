import React from 'react';
import TabView from './TabView';

export default storybook => {
  storybook.storiesOf('TabView', module).addStoryTable([
    {
      name: 'TabView',
      story: () => (
        <TabView
          tabs={[
            {
              key: 'tab1',
              name: 'Tab 1',
              renderFn: () => (
                <div>
                  <h1>Tab 1</h1>
                  <p>Tab content</p>
                </div>
              )
            },
            {
              key: 'tab2',
              name: 'Tab 2',
              renderFn: () => (
                <div>
                  <h1>Tab 2</h1>
                  <p>Placeholder text for tab 2</p>
                </div>
              )
            },
            {
              key: 'tab3',
              name: 'Tab 3',
              renderFn: () => (
                <div>
                  <h1>Tab 3</h1>
                  <p>Tab 3 Body</p>
                </div>
              )
            }
          ]}
        />
      )
    }
  ]);
};
