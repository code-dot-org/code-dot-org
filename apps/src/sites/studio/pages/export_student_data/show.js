import React from 'react';

import ExportStudentDataTable from '@cdo/apps/templates/exportStudentData/ExportStudentDataTable';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', function () {
  const mountPoint = document.getElementById('export-student-data');
  if (!mountPoint) {
    return;
  }

  const script = document.querySelector('script[data-sections]');
  const sections = JSON.parse(script.dataset.sections);

  createReactRoot(<ExportStudentDataTable sections={sections} />, mountPoint);
});
