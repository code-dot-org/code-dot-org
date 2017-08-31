import React from 'react';
import FindLocalClassBanner from './FindLocalClassBanner';
import Responsive from '../../responsive';

const responsive = new Responsive();

export default storybook => {
  return storybook
    .storiesOf('FindLocalClassBanner', module)
    .addStoryTable([
      {
        name: 'default',
        description: 'Example FindLocalClassBanner',
        story: () => (
          <FindLocalClassBanner
            codeOrgUrlPrefix={"https://code.org"}
            isRtl={false}
            responsive={responsive}
          />
        )
      }
    ]);
};
