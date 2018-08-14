import React from 'react';
import AssetRow from "./AssetRow";

export default storybook => {
  return storybook
    .storiesOf('AssetRow', module)
    .addStoryTable([
      {
        name: 'audio',
        story: () => (
          <div style={{width: 800}}>
            <AssetRow
              name={'AudioTest'}
              type={'audio'}
              useFilesApi={true}
              onDelete={()=>{}}
              useUpdatedStyles={true}
            />
          </div>
        )
      },
      {
        name: 'image',
        story: () => (
          <div style={{width: 800}}>
            <AssetRow
              name={'ImageTest'}
              type={'image'}
              useFilesApi={true}
              onDelete={()=>{}}
              useUpdatedStyles={true}
            />
          </div>
        )
      },
      {
        name: 'audio with choose',
        story: () => (
          <div style={{width: 800}}>
            <AssetRow
              name={'AudioTest'}
              type={'audio'}
              useFilesApi={true}
              onDelete={()=>{}}
              onChoose={()=>{}}
              useUpdatedStyles={true}
            />
          </div>
        )
      },
      {
        name: 'image with choose',
        story: () => (
          <div style={{width: 800}}>
            <AssetRow
              name={'ImageTest'}
              type={'image'}
              useFilesApi={true}
              onDelete={()=>{}}
              onChoose={()=>{}}
              useUpdatedStyles={true}
            />
          </div>
        )
      }
    ]);
};

