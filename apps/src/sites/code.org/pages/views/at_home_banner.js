import React from 'react';
import ReactDOM from 'react-dom';
import AtHomeBanner from '@cdo/apps/templates/AtHomeBanner';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <AtHomeBanner />,
    document.getElementById('at-home-banner-container')
  );
});
