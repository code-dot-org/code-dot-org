import Papa from 'papaparse';

import {parseCSV} from '../../src/csvReaderWrapper';
import {invalidatePendingDatasetLoads} from '../../src/datasetLoad';
import {resetState} from '../../src/redux';
import {store} from '../../src/store';

vi.mock('papaparse', () => ({default: {parse: vi.fn()}}));

const parseResult = animal => ({
  data: [
    {animal, legs: '4'},
    {animal, legs: '2'},
  ],
});

describe('parseCSV', () => {
  beforeEach(() => {
    store.dispatch(resetState());
    invalidatePendingDatasetLoads();
    Papa.parse.mockReset();
  });

  test('imports the data and resolves when the download completes', async () => {
    const loaded = parseCSV('cats.csv', true, false);
    Papa.parse.mock.calls[0][1].complete(parseResult('cat'));

    await loaded;
    expect(store.getState().data[0].animal).toBe('cat');
  });

  test('drops a download that completes after a newer load started', () => {
    parseCSV('cats.csv', true, false);
    const completeStaleLoad = Papa.parse.mock.calls[0][1].complete;

    invalidatePendingDatasetLoads();
    parseCSV('dogs.csv', true, false);
    Papa.parse.mock.calls[1][1].complete(parseResult('dog'));
    completeStaleLoad(parseResult('cat'));

    expect(store.getState().data[0].animal).toBe('dog');
  });
});
