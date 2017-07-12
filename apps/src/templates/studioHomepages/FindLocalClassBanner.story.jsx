import React from 'react';
import FindLocalClassBanner from './FindLocalClassBanner';

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
          />
        )
      }
    ]);
};
