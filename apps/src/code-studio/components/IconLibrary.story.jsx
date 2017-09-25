import React from 'react';
import IconLibrary from './IconLibrary';

export default storybook => {
  return storybook
    .storiesOf('IconLibrary', module)
    .addWithInfo(
      'Select a Classroom',
      'Dialog for choosing a Google Classroom from the API.',
      () => (
        <div style={{width: 800}}>
          <IconLibrary
            assetChosen={() => {}}
          />
        </div>
      )
    );
};
