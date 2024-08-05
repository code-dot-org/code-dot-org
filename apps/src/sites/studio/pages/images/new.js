import React from 'react';
import {createRoot} from 'react-dom/client';

import UploadImageForm from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageForm';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));
  root.render(<UploadImageForm />);
});
