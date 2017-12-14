import React from 'react';
import {LocalClassActionBlock, AdministratorResourcesActionBlock} from './TwoColumnActionBlock';

export default storybook => {
  return storybook
    .storiesOf('TwoColumnActionBlock', module)
    .withReduxStore()
    .addStoryTable([
      {
        name: 'Local Class Action Block',
        description: 'Example LocalClassActionBlock',
        story: () => (
          <LocalClassActionBlock
            showHeading={true}
          />
        )
      },
      {
        name: 'Administrator Resources Action Block',
        description: 'Example AdministratorResourcesActionBlock',
        story: () => (
          <AdministratorResourcesActionBlock
            showHeading={true}
          />
        )
      }
    ]);
};
