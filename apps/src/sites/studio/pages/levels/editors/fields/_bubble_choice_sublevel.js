import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import ImageInput from '@cdo/apps/lib/levelbuilder/ImageInput';

$(document).ready(function () {
  const imageUrlInput = $('input#level_thumbnail_url');

  ReactDOM.render(
    <ImageInput
      updateImageUrl={newImageUrl => imageUrlInput.val(newImageUrl)}
      initialImageUrl={imageUrlInput.val()}
      showPreview
    />,
    $('#upload-image-button').get(0)
  );
});
