import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';

$(() => {
  ReactDOM.render(
    <RegionalWorkshopCatalog />,
    document.getElementById('regional-workshop-catalog')
  );
});
