/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals scriptData, i18nData */

import React from 'react';
import ReactDOM from 'react-dom';
import ScriptEditor from './components/ScriptEditor';

ReactDOM.render(
  <ScriptEditor scriptData={scriptData} i18nData={i18nData} />,
  document.querySelector('.edit_container')
);
