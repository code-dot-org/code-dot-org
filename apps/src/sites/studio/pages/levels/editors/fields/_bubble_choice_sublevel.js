import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import ImageInput from '@cdo/apps/levelbuilder/ImageInput';

$(document).ready(function () {
  const imageUrlInput = $('input#level_thumbnail_url');

  const root = createRoot($('#upload-image-button').get(0));

  root.render(<ImageInput
    updateImageUrl={newImageUrl => imageUrlInput.val(newImageUrl)}
    initialImageUrl={imageUrlInput.val()}
    showPreview
  />);
});
