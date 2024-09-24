import React from 'react';
import ReactDOM from 'react-dom';

import CensusMap from '@cdo/apps/templates/census/CensusMap';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const tileset = getScriptData('tileset');
  const mapElement = document.getElementById('census-map');
  if (mapElement) {
    ReactDOM.render(<CensusMap tileset={tileset} />, mapElement);
  }
});
