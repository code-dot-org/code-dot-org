import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';

$(document).ready(() => {
  const root = createRoot(document.getElementById('form'));
  root.render(<NewUnitForm />);
});
