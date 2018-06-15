import React from 'react';
import FallbackPlayerCaptionDialogLink from './FallbackPlayerCaptionDialogLink';

export default storybook => {
  return storybook
    .storiesOf('Dialogs/FallbackPlayerCaptionDialogLink', module)
    .addStoryTable([
      {
        name: 'FallbackPlayerCaptionDialogLink',
        description: "Link shown below standalone level's fallback video player, which pops a dialog explaining that captions are available on YouTube.",
        story: () => (
          <FallbackPlayerCaptionDialogLink/>
        )
      }
    ]);
};
