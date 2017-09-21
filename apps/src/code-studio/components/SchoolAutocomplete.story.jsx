import React from 'react';
import SchoolAutocomplete from './SchoolAutocomplete';

export default storybook => {
  storybook
    .storiesOf('SchoolAutocomplete', module)
    .addStoryTable([
      {
        name: 'standard',
        story: () => (
          <SchoolAutocomplete
            name="nces_school_i"
            id="nces-school"
          />
        )
      },
    ]);
};
