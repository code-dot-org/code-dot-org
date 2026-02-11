import React from 'react';

import UploadImageForm from '@cdo/apps/levelbuilder/lesson-editor/UploadImageForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  createReactRoot(<UploadImageForm />, document.getElementById('form'));
});
