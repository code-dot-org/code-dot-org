import $ from 'jquery';
import React from 'react';

import ImageInput from '@cdo/apps/levelbuilder/ImageInput';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const imageUrlInput = $('input#level_thumbnail_url');

  createReactRoot(
    <ImageInput
      updateImageUrl={newImageUrl => imageUrlInput.val(newImageUrl)}
      initialImageUrl={imageUrlInput.val()}
      showPreview
    />,
    $('#upload-image-button').get(0)
  );
});
