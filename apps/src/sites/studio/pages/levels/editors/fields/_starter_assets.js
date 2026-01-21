import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditStarterAssets from '@cdo/apps/lab2/levelEditors/starterAssets/EditStarterAssets';

$(document).ready(function () {
  const script = document.querySelector(`script[data-levelname]`);
  const levelName = script.dataset.levelname;

  const root = createRoot(document.getElementById('starter-assets-editor'));
  root.render(<EditStarterAssets levelName={levelName} />);
});
