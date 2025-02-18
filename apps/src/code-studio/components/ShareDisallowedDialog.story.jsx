import React from 'react';

import {UnconnectedShareDisallowedDialog as ShareDisallowedDialog} from './ShareDisallowedDialog';

export default {
  component: ShareDisallowedDialog,
};

const Template = args => <ShareDisallowedDialog {...args} />;

export const BasicExample = Template.bind({});
BasicExample.args = {
  isOpen: true,
  hideShareDialog: () => {},
};
