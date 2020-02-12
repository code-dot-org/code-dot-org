import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import data, {setLbData} from '@cdo/apps/storage/redux/data';
import Dataset from '@cdo/apps/storage/levelbuilder/Dataset';

$(document).ready(function() {
  const dataset = getScriptData('dataset');
  const tableName = getScriptData('tableName');
  dataset.records.shift();
  registerReducers({data});
  const store = getStore();
  store.dispatch(setLbData(tableName, dataset.records, dataset.columns));

  ReactDOM.render(
    <Provider store={store}>
      <Dataset />
    </Provider>,
    document.querySelector('.dataset')
  );
  console.log(dataset);
});
