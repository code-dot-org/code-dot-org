import React from 'react';
import ReactDOM from 'react-dom';

import PortfolioContainer from '@cdo/apps/portfolio/PortfolioContainer';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const portfolioData = getScriptData('portfolioData');
  ReactDOM.render(
    <PortfolioContainer
      studentName={portfolioData.studentName}
      portfolioEntries={portfolioData.portfolioEntries}
    />,
    document.getElementById('portfolio')
  );
});
