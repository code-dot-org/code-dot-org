import React from 'react';
import AddAssetButtonRow from './AddAssetButtonRow';

const mockApi = {
  getUploadUrl: () => {
    return '/some-url';
  },
  wrapUploadDoneCallback: f => {
    return f;
  },
  wrapUploadStartCallback: f => {
    return f;
  }
};

export default storybook =>
  storybook.storiesOf('AddAssetButtonRow', module).addStoryTable([
    {
      name: 'Just Buttons',
      story: () => (
        <div>
          <AddAssetButtonRow
            uploadsEnabled={true}
            allowedExtensions=""
            api={mockApi}
            onUploadStart={() => console.log('onUploadStart')}
            onUploadDone={() => console.log('onUploadDone')}
            onUploadError={() => console.log('onUploadError')}
            onSelectRecord={() => console.log('onSelectRecord')}
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
            api={mockApi}
            onUploadStart={() => console.log('onUploadStart')}
            onUploadDone={() => console.log('onUploadDone')}
            onUploadError={() => console.log('onUploadError')}
            onSelectRecord={() => console.log('onSelectRecord')}
            statusMessage="This is a status message"
          />
        </div>
      )
    }
  ]);
