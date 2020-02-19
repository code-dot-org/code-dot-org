import React from 'react';
import ReactDOM from 'react-dom';
import DatasetList from '@cdo/apps/storage/levelbuilder/DatasetList';

$(document).ready(function() {
  ReactDOM.render(<DatasetList />, document.querySelector('.datasets'));
});
