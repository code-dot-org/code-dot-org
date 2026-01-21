import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import TeacherAccountRequiredPage from '@cdo/apps/templates/gates/TeacherAccountRequiredPage';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('teacher-account-required-page'));
  root.render(<TeacherAccountRequiredPage />);
});
