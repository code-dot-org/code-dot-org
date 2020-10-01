import React from 'react';
import ReactDOM from 'react-dom';
import VirtualHocBanner from '@cdo/apps/templates/VirtualHoCBanner';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <VirtualHocBanner />,
    document.getElementById('virtual-hoc-banner-container')
  );
});
