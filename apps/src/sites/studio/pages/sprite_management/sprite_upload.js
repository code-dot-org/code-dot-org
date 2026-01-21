import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import SpriteUpload from '@cdo/apps/code-studio/assets/SpriteUpload';

$(document).ready(function () {
  const root = createRoot(document.getElementById('sprite-upload-container'));
  root.render(<SpriteUpload />);
});
