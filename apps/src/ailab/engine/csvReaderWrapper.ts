import Papa, {type ParseResult} from 'papaparse';

import {ColumnTypes} from './constants';
import {containsOnlyNumbers} from './helpers/columnDetails';
import type {DataRow, DatasetError} from './types';

export const MIN_CSV_ROWS = 2;
export const MIN_CSV_COLUMNS = 2;

export type CsvResult =
  | {ok: true; rows: DataRow[]; removedRowsCount: number}
  | {ok: false; reason: DatasetError};

/*
  Three ways in, because the input decides both the papaparse overload and
  whether there is anything to wait for. None of them touch the store: the
  caller holds the rows until the rest of the dataset is ready.
*/

/* CSV text, which papaparse reads without yielding. */
export const parseCsvText = (csv: string): CsvResult =>
  readRows(Papa.parse<Record<string, string>>(csv, PARSE_OPTIONS));

/* A CSV of ours. Resolves even when the fetch fails. */
export const fetchCsv = (url: string): Promise<CsvResult> =>
  new Promise(resolve =>
    Papa.parse(url, {
      ...PARSE_OPTIONS,
      download: true,
      complete: completeWith(resolve),
      error: failWith(resolve),
    })
  );

/* A CSV the student uploaded, which papaparse reads through a FileReader. */
export const parseCsvFile = (file: File): Promise<CsvResult> =>
  new Promise(resolve =>
    Papa.parse<Record<string, string>>(file as unknown as string, {
      ...PARSE_OPTIONS,
      complete: completeWith(resolve),
      error: failWith(resolve),
    })
  );

const PARSE_OPTIONS = {header: true, skipEmptyLines: true} as const;

type Resolve = (result: CsvResult) => void;

// Declared apart from the config so the remote overload accepts it too.
const completeWith =
  (resolve: Resolve) => (result: ParseResult<Record<string, string>>) =>
    resolve(readRows(result));

const failWith = (resolve: Resolve) => () =>
  resolve({ok: false, reason: 'loadFailed' as const});

/* The type each column looks like, for a dataset that came without metadata. */
export const inferColumnTypes = (rows: DataRow[]): Record<string, string> =>
  Object.fromEntries(
    Object.keys(rows[0] ?? {}).map(column => [
      column,
      containsOnlyNumbers(rows, column)
        ? ColumnTypes.NUMERICAL
        : ColumnTypes.CATEGORICAL,
    ])
  );

const readRows = (result: ParseResult<Record<string, string>>): CsvResult => {
  const data = result.data;
  const cleanedData = cleanData(data);

  if (cleanedData.length < MIN_CSV_ROWS) {
    return {ok: false, reason: 'tooFewRows'};
  } else if (Object.keys(cleanedData[0]).length < MIN_CSV_COLUMNS) {
    return {ok: false, reason: 'tooFewColumns'};
  }

  return {
    ok: true,
    rows: cleanedData,
    removedRowsCount: data.length - cleanedData.length,
  };
};

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
