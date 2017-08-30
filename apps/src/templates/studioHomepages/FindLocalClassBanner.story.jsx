import React from 'react';
import FindLocalClassBanner from './FindLocalClassBanner';
import Responsive from '../../responsive';

const responsive = new Responsive({
  [Responsive.ResponsiveSize.lg]: 1024,
  [Responsive.ResponsiveSize.md]: 720,
  [Responsive.ResponsiveSize.sm]: 650,
  [Responsive.ResponsiveSize.xs]: 0
});

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
