import React from 'react';

import NewUnitForm from '@cdo/apps/levelbuilder/unit-editor/NewUnitForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(() => {
  createReactRoot(<NewUnitForm />, document.getElementById('form'));
});
