import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import getScriptData from '@cdo/apps/util/getScriptData';
import {getStore} from '@cdo/apps/redux';

const container = document.getElementsByClassName('script_name_container');
if (container.length) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <ScriptName {...getScriptData('scriptname')} />
    </Provider>,
    container[0]
  );
}
