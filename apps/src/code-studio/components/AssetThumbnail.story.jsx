import React from 'react';

import AssetThumbnail from './AssetThumbnail';

export default {
  component: AssetThumbnail,
};

// Template
const Template = args => (
  <div style={{width: 800}}>
    <AssetThumbnail
      name="AudioTest"
      useFilesApi={true}
      projectId="123"
      {...args}
    />
  </div>
);

// Stories
export const ImageThumbnail = Template.bind({});
ImageThumbnail.args = {
  type: 'image',
};

export const AudioThumbnail = Template.bind({});
AudioThumbnail.args = {
  type: 'audio',
};

export const VideoThumbnail = Template.bind({});
VideoThumbnail.args = {
  type: 'video',
};

export const DocThumbnail = Template.bind({});
DocThumbnail.args = {
  type: 'doc',
};

export const PDFThumbnail = Template.bind({});
PDFThumbnail.args = {
  type: 'pdf',
};
