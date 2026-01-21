import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import EnrollmentCancelButton from '@cdo/apps/code-studio/pd/workshop_enrollment/enrollmentCancelButton';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('workshop-container'));
  root.render(<EnrollmentCancelButton {...getScriptData('props')} />);
});
