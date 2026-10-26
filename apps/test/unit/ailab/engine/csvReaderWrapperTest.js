/*
  The reader hands rows back rather than writing them to the store, so that a
  caller can hold them until the rest of the dataset is ready.
*/
import Papa from 'papaparse';

import {ColumnTypes} from '@cdo/apps/ailab/engine/constants';
import {
  fetchCsv,
  inferColumnTypes,
  parseCsvText,
} from '@cdo/apps/ailab/engine/csvReaderWrapper';

jest.mock('papaparse', () => ({__esModule: true, default: {parse: jest.fn()}}));

const ANIMALS = [
  {animal: 'cat', legs: '4'},
  {animal: 'bird', legs: '2'},
];

beforeEach(() => Papa.parse.mockReset());

// The text reader is synchronous, so the mock returns what papaparse would.
const read = data => {
  Papa.parse.mockReturnValue({data});
  return parseCsvText('ignored, papaparse is mocked');
};

describe('fetchCsv', () => {
  test('resolves with the rows once the download completes', async () => {
    const loading = fetchCsv('animals.csv');
    Papa.parse.mock.calls[0][1].complete({data: ANIMALS});

    expect(await loading).toEqual({
      ok: true,
      rows: ANIMALS,
      removedRowsCount: 0,
    });
  });

  // Nothing resolved this before, so the lab waited for it forever.
  test('resolves a failure when the download errors', async () => {
    const loading = fetchCsv('missing.csv');
    Papa.parse.mock.calls[0][1].error();

    expect(await loading).toEqual({ok: false, reason: 'loadFailed'});
  });
});

describe('parseCsvText', () => {
  test('counts the rows it dropped for having a blank cell', () => {
    expect(read([...ANIMALS, {animal: 'dog', legs: ''}])).toEqual({
      ok: true,
      rows: ANIMALS,
      removedRowsCount: 1,
    });
  });

  test('declines a file with too few usable rows', () => {
    expect(read([ANIMALS[0]])).toEqual({ok: false, reason: 'tooFewRows'});
  });

  test('declines a file with too few columns', () => {
    expect(read([{animal: 'cat'}, {animal: 'bird'}])).toEqual({
      ok: false,
      reason: 'tooFewColumns',
    });
  });
});

describe('inferColumnTypes', () => {
  test('reads a type per column, for a dataset that came without metadata', () => {
    expect(inferColumnTypes(ANIMALS)).toEqual({
      animal: ColumnTypes.CATEGORICAL,
      legs: ColumnTypes.NUMERICAL,
    });
  });
});
