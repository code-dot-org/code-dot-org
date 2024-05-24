import React from 'react';

import SearchBar from './SearchBar';

export default {
  component: SearchBar,
};

const Template = args => (
  <SearchBar
    placeholderText="Some text"
    onChange={() => console.log('click')}
    {...args}
  />
);

export const SearchButtonNoClear = Template.bind({});
SearchButtonNoClear.args = {
  clearButton: false,
};

export const SearchButtonClear = Template.bind({});
SearchButtonClear.args = {
  clearButton: true,
};
