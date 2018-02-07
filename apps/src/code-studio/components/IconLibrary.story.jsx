import React from 'react';
import IconLibrary from './IconLibrary';

export default storybook => {
  return storybook
    .storiesOf('IconLibrary', module)
    .add('default', () => (
        <div style={{width: 800}}>
          <IconLibrary
            assetChosen={() => {}}
          />
        </div>
      )
    );
};
