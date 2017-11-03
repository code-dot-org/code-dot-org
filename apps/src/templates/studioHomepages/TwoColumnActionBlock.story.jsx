import React from 'react';
import {LocalClassActionBlock, AdministratorResourcesActionBlock} from './TwoColumnActionBlock';
import Responsive from '../../responsive';

const responsive = new Responsive();

export default storybook => {
  return storybook
    .storiesOf('TwoColumnActionBlock', module)
    .addStoryTable([
      {
        name: 'Local Class Action Block',
        description: 'Example LocalClassActionBlock',
        story: () => (
          <LocalClassActionBlock
            isRtl={false}
            responsive={responsive}
            showHeading={true}
          />
        )
      },
      {
        name: 'Administrator Resources Action Block',
        description: 'Example AdministratorResourcesActionBlock',
        story: () => (
          <AdministratorResourcesActionBlock
            isRtl={false}
            responsive={responsive}
            showHeading={true}
          />
        )
      }
    ]);
};
