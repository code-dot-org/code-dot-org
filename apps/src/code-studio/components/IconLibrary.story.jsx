import React from 'react';
import IconLibrary from './IconLibrary';

export default {
  title: 'IconLibrary',
  component: IconLibrary
};

// Template
const Template = args => (
  <div style={{width: 800}}>
    <IconLibrary {...args} />
  </div>
);

// Stories
export const Default = Template.bind({});
Default.args = {
  assetChosen: () => {}
};
