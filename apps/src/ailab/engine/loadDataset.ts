/*
  Loading a dataset, from either of the two places one can come from: ours,
  described by a metadata file, or a CSV the student uploaded. Both assemble
  the whole dataset before writing any of it, so nothing downstream can see
  rows whose columns have no type yet.
*/

import {fetchCsv, inferColumnTypes, parseCsvFile} from './csvReaderWrapper';
import {getDatasetLoadId, isCurrentDatasetLoad} from './datasetLoad';
import {selectableColumns} from './helpers/columnDetails';
import {columnTypesFromMetadata, fetchMetadata} from './jsonReaderWrapper';
import {
  setColumnsByDataType,
  setImportedData,
  setImportedMetadata,
  setInvalidData,
  setPresetColumns,
  setRemovedRowsCount,
} from './redux';
import {store} from './store';
import type {
  DataRow,
  DatasetError,
  Metadata,
  Mode,
  PresetColumns,
} from './types';

interface LoadedDataset {
  rows: DataRow[];
  metadata: Metadata;
  columnsByDataType: Record<string, string>;
  removedRowsCount: number;
  userUploadedData: boolean;
}

export const loadDataset = async (
  csvPath: string,
  jsonPath: string
): Promise<void> => {
  const loadId = getDatasetLoadId();
  const [csv, meta] = await Promise.all([
    fetchCsv(csvPath),
    fetchMetadata(jsonPath),
  ]);
  if (!isCurrentDatasetLoad(loadId)) {
    return;
  }
  if (!csv.ok) {
    reportFailure(csv.reason);
  } else if (!meta.ok) {
    reportFailure(meta.reason);
  } else {
    apply({
      rows: csv.rows,
      metadata: meta.metadata,
      columnsByDataType: columnTypesFromMetadata(meta.metadata),
      removedRowsCount: csv.removedRowsCount,
      userUploadedData: false,
    });
  }
};

/* An uploaded CSV comes with no metadata, so its column types are guessed. */
export const loadUploadedDataset = async (file: File): Promise<void> => {
  const loadId = getDatasetLoadId();
  const csv = await parseCsvFile(file);
  if (!isCurrentDatasetLoad(loadId)) {
    return;
  }
  if (!csv.ok) {
    reportFailure(csv.reason);
    return;
  }
  apply({
    rows: csv.rows,
    metadata: {card: {}},
    columnsByDataType: inferColumnTypes(csv.rows),
    removedRowsCount: csv.removedRowsCount,
    userUploadedData: true,
  });
};

const reportFailure = (reason: DatasetError): void => {
  store.dispatch(setInvalidData(reason));
};

// Nothing may await between these dispatches: together they are one dataset.
const apply = (dataset: LoadedDataset): void => {
  const {rows, metadata, columnsByDataType, removedRowsCount} = dataset;
  store.dispatch(setRemovedRowsCount(removedRowsCount));
  store.dispatch(setImportedData(rows, dataset.userUploadedData));
  store.dispatch(setImportedMetadata(metadata));
  Object.entries(columnsByDataType).forEach(([column, dataType]) =>
    store.dispatch(setColumnsByDataType(column, dataType))
  );
  store.dispatch(setPresetColumns(modeColumns(store.getState().mode, dataset)));
};

/* The columns a level fixes for the student, against the dataset that loaded. */
const modeColumns = (
  mode: Mode | undefined,
  {rows, metadata, columnsByDataType}: LoadedDataset
): PresetColumns => {
  const selectable = selectableColumns(rows, columnsByDataType);
  const isSelectable = (column: string): boolean => {
    if (selectable.includes(column)) {
      return true;
    }
    console.error(
      `AI Lab mode: "${column}" is not a selectable column of this dataset.`
    );
    return false;
  };

  const features = mode?.features?.filter(isSelectable);
  const namedLabel =
    mode?.label ??
    (mode?.hideSelectLabel ? metadata.defaultLabelColumn : undefined);
  const labelColumn =
    namedLabel !== undefined && isSelectable(namedLabel)
      ? namedLabel
      : undefined;

  return {
    labelColumn,
    // A column can't be both the label and a feature.
    selectedFeatures: labelColumn
      ? features?.filter(feature => feature !== labelColumn)
      : features,
  };
};
