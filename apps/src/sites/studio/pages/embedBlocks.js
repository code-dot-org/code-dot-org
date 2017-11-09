/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * embedded blocks via blockly-in-an-iframe.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import ReadOnlyBlockSpace from '@cdo/apps/templates/ReadOnlyBlockSpace';

const div = document.getElementById('embed-blocks');
const xml = new DOMParser().parseFromString(div.firstElementChild.dataset.blocks, 'text/xml');
div.removeAttribute('id');

ReactDOM.render(
  <ReadOnlyBlockSpace
    block={xml}
  />,
  div,
);
