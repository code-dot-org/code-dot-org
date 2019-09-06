import React from 'react';
import SearchBar from './SearchBar';

export default storybook => {
  storybook.storiesOf('SearchBar', module).addStoryTable([
    {
      name: 'Search Bar',
      story: () => (
        <SearchBar
          placeholderText={'Some Text'}
          styles={{}}
          onChange={() => {}}
        />
      )
    }
  ]);
};
