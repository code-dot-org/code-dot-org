import React from 'react';

import FallbackPlayerCaptionDialogLink from './FallbackPlayerCaptionDialogLink';

export default {
  component: FallbackPlayerCaptionDialogLink,
};

const Template = args => <FallbackPlayerCaptionDialogLink {...args} />;

export const BelowStandaloneVideoPlayer = Template.bind({});
BelowStandaloneVideoPlayer.args = {};

export const InHeaderOfDialogVideoPlayer = Template.bind({});
InHeaderOfDialogVideoPlayer.args = {
  inDialog: true,
};
