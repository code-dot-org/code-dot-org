import React from 'react';
import ReactDOM from 'react-dom';
import ProfessionalLearningApplyBanner from '@cdo/apps/templates/ProfessionalLearningApplyBanner';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <ProfessionalLearningApplyBanner {...getScriptData('props')} />,
    document.getElementById('apply-banner-container')
  );
});
