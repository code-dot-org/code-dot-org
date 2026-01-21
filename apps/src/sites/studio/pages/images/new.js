import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import UploadImageForm from '@cdo/apps/levelbuilder/lesson-editor/UploadImageForm';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));
  root.render(<UploadImageForm />);
});
