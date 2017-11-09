import React from 'react';
import LocalClassActionBlock from './studioHomepages/LocalClassActionBlock';
import AdministratorResources from './studioHomepages/AdministratorResources';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import responsive from '../code-studio/responsiveRedux';
import isRtl from '../code-studio/isRtlRedux';

export default storybook => {
  const store = createStore(combineReducers({responsive, isRtl}));
  return storybook
    .storiesOf('TwoColumnActionBlock', module)
    .addStoryTable([
      {
        name: 'Local Class Action Block',
        description: 'Example LocalClassActionBlock',
        story: () => (
          <Provider store={store}>
            <LocalClassActionBlock
              showHeading={true}
            />
          </Provider>
        )
      },
      {
        name: 'Administrator Resources Action Block',
        description: 'Example AdministratorResourcesActionBlock',
        story: () => (
          <Provider store={store}>
            <AdministratorResources
              showHeading={true}
            />
          </Provider>
        )
      }
    ]);
};
