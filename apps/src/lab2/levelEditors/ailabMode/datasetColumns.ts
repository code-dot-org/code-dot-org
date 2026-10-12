import {type Metadata, selectableColumns} from '@code-dot-org/ailab';
import Papa from 'papaparse';
import {useEffect, useState} from 'react';

import {AILAB_ASSET_PATH} from '@cdo/apps/ailab/lab2/assetPath';
import HttpClient from '@cdo/apps/util/HttpClient';

export interface DatasetFiles {
  id: string;
  path: string;
  metadataPath: string;
}

export interface DatasetColumns {
  selectable: string[];
  defaultLabel?: string;
}

// The metadata types the columns, but only the rows tell which ones students can choose.
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

interface ColumnsResult {
  datasetId: string;
  columns?: DatasetColumns;
  failed?: boolean;
}

export function useDatasetColumns(dataset: DatasetFiles | undefined): {
  columns?: DatasetColumns;
  failed: boolean;
} {
  const [result, setResult] = useState<ColumnsResult>();

  useEffect(() => {
    if (!dataset) {
      return;
    }
    let isCurrent = true;
    fetchDatasetColumns(dataset).then(
      columns => isCurrent && setResult({datasetId: dataset.id, columns}),
      () => isCurrent && setResult({datasetId: dataset.id, failed: true})
    );
    return () => {
      isCurrent = false;
    };
  }, [dataset]);

  const isForDataset = !!dataset && result?.datasetId === dataset.id;
  return {
    columns: isForDataset ? result.columns : undefined,
    failed: isForDataset && !!result.failed,
  };
}
