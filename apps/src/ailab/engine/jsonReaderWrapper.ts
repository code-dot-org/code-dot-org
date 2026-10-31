import HttpClient from '@cdo/apps/util/HttpClient';

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
    const {value} = await HttpClient.fetchJson<Metadata>(jsonfile);
    return {ok: true, metadata: value};
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
