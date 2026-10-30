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
  const realFetch = global.fetch;
  afterEach(() => (global.fetch = realFetch));

  test('resolves with the rows once the download completes', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ok: true, text: () => Promise.resolve('animal,legs')})
    );
    Papa.parse.mockReturnValue({data: ANIMALS});

    expect(await fetchCsv('animals.csv')).toEqual({
      ok: true,
      rows: ANIMALS,
      removedRowsCount: 0,
    });
    expect(Papa.parse.mock.calls[0][0]).toBe('animal,legs');
  });

  test('resolves a failure when the server refuses', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: false}));

    expect(await fetchCsv('missing.csv')).toEqual({
      ok: false,
      reason: 'loadFailed',
    });
  });

  test('resolves a failure when the request is blocked', async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError('blocked')));

    expect(await fetchCsv('blocked.csv')).toEqual({
      ok: false,
      reason: 'loadFailed',
    });
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
