import React from 'react';
import AutocompleteDropdown from './AutocompleteDropdown';

const engineers = [
    { value: 'EB', label: 'Erin Bond'},
    { value: 'EP', label: 'Erin Peach' },
    { value: 'CB', label: 'Caley Brock' },
    { value: 'CC', label: 'Clare Constantine' },
    { value: 'JP', label: 'Joanne Polsky' },
    { value: 'BVM', label: 'Brent Van Minnen' },
    { value: 'BR', label: 'Brendan Reville' },
    { value: 'JL', label: 'Josh Lory' },
    { value: 'MS', label: 'Mehal Shah' },
    { value: 'EH', label: 'Elijah Hamovitz' },
    { value: 'JS', label: 'Jeremy Stone' },
    { value: 'EJ', label: 'Eric Jordan' },
    { value: 'WJ', label: 'Will Jordan' },
    { value: 'BB', label: 'Brad Buchanan' },
    { value: 'AO', label: 'Andrew Oberhardt' },
    { value: 'DB', label: 'David Bailey' },
    { value: 'RK', label: 'Ram Kandasamy' },
  ];

export default storybook => {
  storybook
    .storiesOf('AutocompleteDropdown', module)
    .addStoryTable([
      {
        name:'AutocompleteDropdown',
        story: () => (
          <AutocompleteDropdown
            options={engineers}
          />
        )
      },
    ]);
};
