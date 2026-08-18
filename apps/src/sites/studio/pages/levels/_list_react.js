import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LevelsList from './components/LevelsList';

$(document).ready(() => {
  const container = document.getElementById('levels-list-container');
  if (container) {
    ReactDOM.render(<LevelsList />, container);
  }
});
