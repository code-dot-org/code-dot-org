import {ColumnTypes} from './constants';
import type {Metadata} from './types';

export type MetadataResult =
  | {ok: true; metadata: Metadata}
  | {ok: false; reason: 'loadFailed'};

export const fetchMetadata = (jsonfile: string): Promise<MetadataResult> =>
  new Promise(resolve => {
    const failed = () => resolve({ok: false, reason: 'loadFailed'});
    const rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType('application/json');
    rawFile.open('GET', jsonfile, true);
    rawFile.onerror = failed;
    rawFile.ontimeout = failed;
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState !== 4) {
        return;
      }
      if (rawFile.status !== 200) {
        failed();
        return;
      }
      try {
        resolve({ok: true, metadata: JSON.parse(rawFile.responseText)});
      } catch {
        failed();
      }
    };
    rawFile.send(null);
  });

/* The type each column is described as. A field with no type falls back to categorical. */
export const columnTypesFromMetadata = (
  metadata: Metadata
): Record<string, string> =>
  Object.fromEntries(
    (metadata.fields ?? []).map(field => [
      field.id!,
      field.type ? field.type : ColumnTypes.CATEGORICAL,
    ])
  );
