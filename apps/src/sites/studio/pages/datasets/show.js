import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import data, {
  changeView,
  updateTableColumns,
  updateTableRecords
} from '@cdo/apps/storage/redux/data';
import {DataView} from '@cdo/apps/storage/constants';
import getScriptData from '@cdo/apps/util/getScriptData';
import Dataset from '@cdo/apps/storage/levelbuilder/Dataset';

$(document).ready(function() {
  const dataset = getScriptData('dataset');
  const tableName = getScriptData('tableName');
  const liveDatasets = getScriptData('liveDatasets');
  const isLive = liveDatasets.includes(tableName);

  // records[0] is null. Get rid of it so it doesn't break the table preview
  dataset.records.shift();

  registerReducers({data});
  const store = getStore();

  store.dispatch(changeView(DataView.TABLE, tableName));
  store.dispatch(updateTableRecords(tableName, dataset.records));
  store.dispatch(updateTableColumns(tableName, dataset.columns));

  ReactDOM.render(
    <Provider store={store}>
      <Dataset isLive={isLive} />
    </Provider>,
    document.querySelector('.dataset')
  );
});
