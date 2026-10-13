import {useEffect, useState} from 'react';

import {
  DatasetColumns,
  DatasetFiles,
  fetchDatasetColumns,
} from './datasetColumns';

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
