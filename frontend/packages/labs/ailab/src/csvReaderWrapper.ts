import type {ParseResult} from 'papaparse';
import Papa from 'papaparse';

import {ColumnTypes} from './constants';
import {containsOnlyNumbers} from './helpers/columnDetails';
import {
  setImportedData,
  setInvalidData,
  setColumnsByDataType,
  setRemovedRowsCount,
} from './redux';
import {store} from './store';
import type {DataRow} from './types';

export const parseCSV = (
  csvfile: string,
  download: boolean,
  useDefaultColumnDataType: boolean,
): void => {
  // `csvfile` is either a URL to fetch (download) or a raw CSV string. These
  // are distinct papaparse overloads — `download: true` selects the remote
  // config, a plain string selects the local config — so the runtime branch
  // is also what lets each call type-check (a single config carrying a
  // non-literal `download` matches neither overload).
  const complete = (result: ParseResult<Record<string, string>>) => {
    updateData(result, useDefaultColumnDataType, !download);
  };
  if (download) {
    Papa.parse(csvfile, {
      complete,
      header: true,
      download: true,
      skipEmptyLines: true,
    });
  } else {
    Papa.parse<Record<string, string>>(csvfile, {
      complete,
      header: true,
      skipEmptyLines: true,
    });
  }
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
