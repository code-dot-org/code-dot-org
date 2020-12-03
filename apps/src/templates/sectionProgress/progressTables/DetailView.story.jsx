import React from 'react';
import DetailView from './DetailView';
import {Provider} from 'react-redux';
import {createStore} from '../sectionProgressTestHelpers';

export default storybook => {
  const store = createStore();
  storybook.storiesOf('SectionProgress/DetailView', module).addStoryTable([
    {
      name: 'DetailView',
      story: () => {
        return (
          <div
            className="main"
            style={{
              marginLeft: 80,
              width: 970,
              display: 'block',
              backgroundColor: '#ffffff'
            }}
          >
            <Provider store={store}>
              <DetailView />
            </Provider>
          </div>
        );
      }
    }
  ]);
};
