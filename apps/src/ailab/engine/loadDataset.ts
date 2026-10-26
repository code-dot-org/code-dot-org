/*
  Helpers for loading a dataset, from either of the two places one can come from: ours,
  described by a metadata file, or a CSV the student uploaded.
*/

import {fetchCsv, inferColumnTypes, parseCsvFile} from './csvReaderWrapper';
import {getDatasetLoadId, isCurrentDatasetLoad} from './datasetLoad';
import {selectableColumns} from './helpers/columnDetails';
import {columnTypesFromMetadata, fetchMetadata} from './jsonReaderWrapper';
import {setDatasetLoaded, setInvalidData} from './redux';
import {store} from './store';
import type {Dataset, DatasetError, Mode, PresetColumns} from './types';

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
    const dataset = {
      rows: csv.rows,
      metadata: meta.metadata,
      columnsByDataType: columnTypesFromMetadata(meta.metadata),
      removedRowsCount: csv.removedRowsCount,
    };
    apply(dataset, modeColumns(store.getState().mode, dataset));
  }
};

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
  });
};

const reportFailure = (reason: DatasetError): void => {
  store.dispatch(setInvalidData(reason));
};

const apply = (dataset: Dataset, presetColumns?: PresetColumns): void => {
  store.dispatch(setDatasetLoaded({dataset, presetColumns}));
};

/* Apply any pre-selected columns based on the level's mode and dataset. */
const modeColumns = (
  mode: Mode | undefined,
  {rows, metadata, columnsByDataType}: Dataset
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
