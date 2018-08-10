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
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
            />
          </div>
        )
      },
      {
        name: 'audio asset',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              audioType={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
            />
          </div>
        )
      },
      {
        name: 'normal with choose',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
              onChoose={() => {}}
            />
          </div>
        )
      },
      {
        name: 'audio asset with choose',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              audioType={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
              onChoose={() => {}}
            />
          </div>
        )
      }
      ]);
};

