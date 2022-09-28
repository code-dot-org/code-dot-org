import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import {TextLink} from '@dsco_/link';

$(() => {
  const dataDocs = getScriptData('dataDocs');
  ReactDOM.render(
    dataDocs.map(({key, name}) =>
      React.createElement(TextLink, {
        href: `/data_docs/${key}`,
        text: name,
        key: key
      })
    ),
    document.getElementById('see-data-docs')
  );
});
