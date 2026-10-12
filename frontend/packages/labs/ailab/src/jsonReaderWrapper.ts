import {ColumnTypes} from './constants';
import {getDatasetLoadId, isCurrentDatasetLoad} from './datasetLoad';
import {
  setImportedMetadata,
  setColumnsByDataType,
  setLabelColumn,
} from './redux';
import {store} from './store';
import type {Metadata} from './types';

export const parseJSON = (jsonfile: string): void => {
  const loadId = getDatasetLoadId();
  const rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType('application/json');
  rawFile.open('GET', jsonfile, true);
  rawFile.onreadystatechange = function () {
    if (
      rawFile.readyState === 4 &&
      rawFile.status === 200 &&
      isCurrentDatasetLoad(loadId)
    ) {
      updateData(rawFile.responseText);
    }
  };
  rawFile.send(null);
};

const updateData = (result: string): void => {
  const metadata: Metadata = JSON.parse(result);
  store.dispatch(setImportedMetadata(metadata));

  const state = store.getState();

  if (metadata.fields) {
    for (const field of metadata.fields) {
      const fieldType = field.type ? field.type : ColumnTypes.CATEGORICAL;
      store.dispatch(setColumnsByDataType(field.id!, fieldType));
    }
  }

  // A level that hides the label picker takes the dataset's own default.
  if (state.mode && state.mode.hideSelectLabel && metadata.defaultLabelColumn) {
    store.dispatch(setLabelColumn(metadata.defaultLabelColumn));
  }
};
