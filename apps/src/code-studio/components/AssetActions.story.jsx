import React from 'react';
import AssetActions from "./AssetActions";

export default storybook => {
  return storybook
    .storiesOf('AssetActions', module)
    .addStoryTable([
      {
        name: 'normal',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              audioType={false}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {
              }}
            />
          </div>
        )
      }
      ]);
};

