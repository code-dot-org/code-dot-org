import React from 'react';
import AssetThumbnail from "./AssetThumbnail";

export default storybook => {
  return storybook
    .storiesOf('AssetThumbnail', module)
    .addStoryTable([
      {
        name: 'image',
        story: () => (
          <div style={{width: 800}}>
            <AssetThumbnail
              name="AudioTest"
              type="image"
              useFilesApi={true}
              projectId="123"
            />
          </div>
        )
      },
      {
        name: 'audio',
        story: () => (
          <div style={{width: 800}}>
            <AssetThumbnail
              name="AudioTest"
              type="audio"
              useFilesApi={true}
              projectId="123"
            />
          </div>
        )
      },
      {
        name: 'video',
        story: () => (
          <div style={{width: 800}}>
            <AssetThumbnail
              name="AudioTest"
              type="video"
              useFilesApi={true}
              projectId="123"
            />
          </div>
        )
      },
      {
        name: 'doc',
        story: () => (
          <div style={{width: 800}}>
            <AssetThumbnail
              name="AudioTest"
              type="doc"
              useFilesApi={true}
              projectId="123"
            />
          </div>
        )
      },
      {
        name: 'pdf',
        story: () => (
          <div style={{width: 800}}>
            <AssetThumbnail
              name="AudioTest"
              type="pdf"
              useFilesApi={true}
              projectId="123"
            />
          </div>
        )
      }
    ]);
};

