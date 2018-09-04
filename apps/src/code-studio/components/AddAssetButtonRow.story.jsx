import React from 'react';
import AddAssetButtonRow from './AddAssetButtonRow';

export default storybook => storybook
  .storiesOf('AddAssetButtonRow', module)
  .addStoryTable([
    {
      name: 'Just Buttons',
      story: () => (
        <div>
          <AddAssetButtonRow
            uploadsEnabled={true}
            allowedExtensions=""
            useFilesApi={true}
            onUploadStart={() => console.log("onUploadStart")}
            onUploadDone={() => console.log("onUploadDone")}
            onUploadError={() => console.log("onUploadError")}
            onSelectRecord={() => console.log("onSelectRecord")}
            statusMessage=""
          />
        </div>
      )
    },
    {
      name: 'Buttons and status message',
      story: () => (
        <div>
          <AddAssetButtonRow
            uploadsEnabled={true}
            allowedExtensions=""
            useFilesApi={true}
            onUploadStart={() => console.log("onUploadStart")}
            onUploadDone={() => console.log("onUploadDone")}
            onUploadError={() => console.log("onUploadError")}
            onSelectRecord={() => console.log("onSelectRecord")}
            statusMessage="This is a status message"
          />
        </div>
      )
    }
  ]);
