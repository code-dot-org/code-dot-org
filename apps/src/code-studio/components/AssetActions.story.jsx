import React from 'react';
import AssetActions from "./AssetActions";

export default storybook => {
  return storybook
    .storiesOf('AssetActions', module)
    .addStoryTable([
      {
        name: 'default',
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
              isAudio={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
            />
          </div>
        )
      },
      {
        name: 'audio asset with updated styles',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              isAudio={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
              useUpdatedStyles={true}
            />
          </div>
        )
      },
      {
        name: 'default with choose',
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
              isAudio={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
              onChoose={() => {}}
            />
          </div>
        )
      },
      {
        name: 'audio asset with choose with updated styles',
        story: () => (
          <div style={{width: 800}}>
            <AssetActions
              name="audioTest"
              isAudio={true}
              size={5.3}
              useFilesApi={true}
              onDelete={() => {}}
              onChoose={() => {}}
              useUpdatedStyles={true}
            />
          </div>
        )
      }
      ]);
};

