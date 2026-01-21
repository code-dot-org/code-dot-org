import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import RegionalWorkshopCatalog from '@cdo/apps/code-studio/pd/professional_learning/RegionalWorkshopCatalog';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const nationalWorkshops = getScriptData('nationalWorkshops');
  const zipFromSchoolInfo = getScriptData('zipFromSchoolInfo');
  const root = createRoot(document.getElementById('regional-workshop-catalog'));

  root.render(<RegionalWorkshopCatalog
    nationalWorkshops={nationalWorkshops}
    zipFromSchoolInfo={zipFromSchoolInfo}
  />);
});
