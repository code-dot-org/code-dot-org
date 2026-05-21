import {store} from './index';
import {
  setImportedMetadata,
  setColumnsByDataType,
  setLabelColumn,
} from './redux';
import {ColumnTypes} from './constants';
import {Metadata} from './types';

export const parseJSON = (jsonfile: string): void => {
  const rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType('application/json');
  rawFile.open('GET', jsonfile, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status === 200) {
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

  if (state.mode && state.mode.hideSelectLabel && metadata.defaultLabelColumn) {
    // Use the manifest's default label instead.
    store.dispatch(setLabelColumn(metadata.defaultLabelColumn));
  }
};
