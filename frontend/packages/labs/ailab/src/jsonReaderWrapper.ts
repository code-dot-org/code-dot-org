import {ColumnTypes} from './constants';
import {
  setImportedMetadata,
  setColumnsByDataType,
  setLabelColumn,
} from './redux';
import {store} from './store';
import type {Metadata} from './types';

// Resolves once the request finishes or fails. A request that is no longer
// current when it finishes leaves the store alone.
export const parseJSON = (
  jsonfile: string,
  isCurrent: () => boolean = () => true,
): Promise<void> =>
  new Promise(resolve => {
    const rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType('application/json');
    rawFile.open('GET', jsonfile, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState !== 4) {
        return;
      }
      if (rawFile.status === 200 && isCurrent()) {
        updateData(rawFile.responseText);
      }
      resolve();
    };
    rawFile.send(null);
  });

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
