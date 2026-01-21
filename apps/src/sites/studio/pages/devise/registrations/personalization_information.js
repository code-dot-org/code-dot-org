import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import PersonalizationCollectorContainer from '@cdo/apps/aiDifferentiation/personalization/PersonalizationCollectorContainer';

$(document).ready(() => {
  const root = createRoot(document.getElementById('personalization-information'));
  root.render(<PersonalizationCollectorContainer />);
});
