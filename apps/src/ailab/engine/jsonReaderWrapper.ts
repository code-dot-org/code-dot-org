import {ColumnTypes} from './constants';
import type {Metadata} from './types';

export type MetadataResult =
  | {ok: true; metadata: Metadata}
  | {ok: false; reason: 'loadFailed'};

const LOAD_FAILED: MetadataResult = {ok: false, reason: 'loadFailed'};

/* Fetches a dataset's metadata. Resolves even when the fetch fails. */
export const fetchMetadata = async (
  jsonfile: string
): Promise<MetadataResult> => {
  try {
    const response = await fetch(jsonfile);
    if (!response.ok) {
      return LOAD_FAILED;
    }
    return {ok: true, metadata: await response.json()};
  } catch {
    return LOAD_FAILED;
  }
};

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
