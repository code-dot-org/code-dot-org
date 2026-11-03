import $ from 'jquery';
import React from 'react';

import EditStarterAssets from '@cdo/apps/lab2/levelEditors/starterAssets/EditStarterAssets';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const script = document.querySelector(`script[data-levelname]`);
  const levelName = script.dataset.levelname;

  createReactRoot(
    <EditStarterAssets levelName={levelName} />,
    document.getElementById('starter-assets-editor')
  );
});
