import {ColumnTypes} from './constants';
import {getDatasetLoadId, isCurrentDatasetLoad} from './datasetLoad';
import {setImportedMetadata, setColumnsByDataType} from './redux';
import {store} from './store';
import type {Metadata} from './types';

// If a newer load starts first or the fetch fails, the promise never resolves.
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
