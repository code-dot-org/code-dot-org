import Papa from 'papaparse';

import {type Metadata, selectableColumns} from '@cdo/apps/ailab/engine';
import HttpClient from '@cdo/apps/util/HttpClient';

const AILAB_ASSET_PATH = '/blockly/media/skins/ailab/';

export interface DatasetFiles {
  id: string;
  path: string;
  metadataPath: string;
}

export interface DatasetColumns {
  selectable: string[];
  defaultLabel?: string;
}

export async function fetchDatasetColumns(
  dataset: DatasetFiles
): Promise<DatasetColumns> {
  const [csvResponse, {value: metadata}] = await Promise.all([
    HttpClient.get(AILAB_ASSET_PATH + dataset.path),
    HttpClient.fetchJson<Metadata>(AILAB_ASSET_PATH + dataset.metadataPath),
  ]);
  const rows = Papa.parse<Record<string, string>>(await csvResponse.text(), {
    header: true,
    skipEmptyLines: true,
  }).data;
  const columnTypes = Object.fromEntries(
    (metadata.fields ?? []).map(field => [
      field.id,
      field.type ?? 'categorical',
    ])
  );
  const selectable = selectableColumns(rows, columnTypes);
  const {defaultLabelColumn} = metadata;
  return {
    selectable,
    defaultLabel:
      defaultLabelColumn && selectable.includes(defaultLabelColumn)
        ? defaultLabelColumn
        : undefined,
  };
}
