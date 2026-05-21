import Papa, {ParseResult} from 'papaparse';
import {store} from './index';
import {
  setImportedData,
  setInvalidData,
  setColumnsByDataType,
  setRemovedRowsCount,
} from './redux';
import {containsOnlyNumbers} from './helpers/columnDetails';
import {ColumnTypes} from './constants';
import {DataRow} from './types';

export const parseCSV = (
  csvfile: string,
  download: boolean,
  useDefaultColumnDataType: boolean,
): void => {
  Papa.parse(csvfile, {
    complete: (result: ParseResult<Record<string, string>>) => {
      updateData(result, useDefaultColumnDataType, !download);
    },
    header: true,
    download: download,
    skipEmptyLines: true,
  });
};

export const MIN_CSV_ROWS = 2;
export const MIN_CSV_COLUMNS = 2;

const cleanData = (data: Record<string, string>[]): DataRow[] => {
  const cleanedData: DataRow[] = [];

  for (const row of data) {
    const cleanedRow = getCleanedRow(row);
    if (cleanedRow !== null) {
      cleanedData.push(cleanedRow);
    }
  }

  return cleanedData;
};

const getCleanedRow = (row: Record<string, string>): DataRow | null => {
  for (const column in row) {
    if (column !== '__parsed_extra') {
      const cellValue = row[column];

      if (!isCellValid(cellValue)) {
        return null;
      }

      row[column] = cellValue.trim();
    }
  }

  return row;
};

const isCellValid = (cell: string | undefined): boolean => {
  return cell !== undefined && cell !== '' && typeof cell === 'string';
};

const updateData = (
  result: ParseResult<Record<string, string>>,
  useDefaultColumnDataType: boolean,
  userUploadedData: boolean,
): void => {
  const data = result.data;
  const cleanedData = cleanData(data);

  if (cleanedData.length < MIN_CSV_ROWS) {
    store.dispatch(setInvalidData('tooFewRows'));
    return;
  } else if (Object.keys(cleanedData[0]).length < MIN_CSV_COLUMNS) {
    store.dispatch(setInvalidData('tooFewColumns'));
    return;
  }

  countRemovedRows(data, cleanedData);
  store.dispatch(setImportedData(cleanedData, userUploadedData));
  if (useDefaultColumnDataType) {
    setDefaultColumnDataType(cleanedData);
  }
};

const countRemovedRows = (
  originalData: Record<string, string>[],
  cleanedData: DataRow[],
): void => {
  const removedRowsCount = originalData.length - cleanedData.length;
  store.dispatch(setRemovedRowsCount(removedRowsCount));
};

const setDefaultColumnDataType = (data: DataRow[]): void => {
  const columns = Object.keys(data[0]);
  for (const column of columns) {
    if (containsOnlyNumbers(data, column)) {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL));
    } else {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL));
    }
  }
};
