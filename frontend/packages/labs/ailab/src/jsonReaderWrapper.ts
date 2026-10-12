import {ColumnTypes} from './constants';
import {getDatasetLoadId, isCurrentDatasetLoad} from './datasetLoad';
import {setImportedMetadata, setColumnsByDataType} from './redux';
import {store} from './store';
import type {Metadata} from './types';

// A superseded or failed load never settles.
export const parseJSON = (jsonfile: string): Promise<void> =>
  new Promise(resolve => {
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
        resolve();
      }
    };
    rawFile.send(null);
  });

const updateData = (result: string): void => {
  const metadata: Metadata = JSON.parse(result);
  store.dispatch(setImportedMetadata(metadata));

  if (metadata.fields) {
    for (const field of metadata.fields) {
      const fieldType = field.type ? field.type : ColumnTypes.CATEGORICAL;
      store.dispatch(setColumnsByDataType(field.id!, fieldType));
    }
  }
};
