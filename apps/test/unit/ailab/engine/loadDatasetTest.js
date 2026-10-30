import {fetchCsv, parseCsvFile} from '@cdo/apps/ailab/engine/csvReaderWrapper';
import {invalidatePendingDatasetLoads} from '@cdo/apps/ailab/engine/datasetLoad';
import {fetchMetadata} from '@cdo/apps/ailab/engine/jsonReaderWrapper';
import {
  loadDataset,
  loadUploadedDataset,
} from '@cdo/apps/ailab/engine/loadDataset';
import {
  resetState,
  setDatasetLoaded,
  setMode,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper', () => ({
  ...jest.requireActual('@cdo/apps/ailab/engine/csvReaderWrapper'),
  fetchCsv: jest.fn(),
  parseCsvFile: jest.fn(),
}));
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper', () => ({
  ...jest.requireActual('@cdo/apps/ailab/engine/jsonReaderWrapper'),
  fetchMetadata: jest.fn(),
}));

const ROWS = [
  {name: 'Tom', legs: '4', animal: 'cat'},
  {name: 'Tweety', legs: '2', animal: 'bird'},
];

// `name` has no type in the metadata, so it is not selectable.
const METADATA = {
  card: {},
  defaultLabelColumn: 'animal',
  fields: [
    {id: 'legs', type: 'numerical'},
    {id: 'animal', type: 'categorical'},
  ],
};

const ROWS_READ = {ok: true, rows: ROWS, removedRowsCount: 0};

beforeEach(() => {
  store.dispatch(resetState());
  invalidatePendingDatasetLoads();
  fetchCsv.mockResolvedValue(ROWS_READ);
  parseCsvFile.mockResolvedValue(ROWS_READ);
  fetchMetadata.mockResolvedValue({ok: true, metadata: METADATA});
});

afterEach(() => jest.clearAllMocks());

async function load(mode) {
  store.dispatch(setMode(mode));
  await loadDataset('animals.csv', 'animals.json');
  const {labelColumn, selectedFeatures} = store.getState().presetColumns;
  return {labelColumn, selectedFeatures};
}

describe('loadDataset', () => {
  test('writes the rows, the metadata and the column types together', async () => {
    await loadDataset('animals.csv', 'animals.json');

    expect(store.getState().dataset).toEqual({
      rows: ROWS,
      metadata: METADATA,
      columnsByDataType: {legs: 'numerical', animal: 'categorical'},
      removedRowsCount: 0,
    });
  });

  test('replaces the column types rather than adding to them', async () => {
    store.dispatch(
      setDatasetLoaded({
        dataset: {
          rows: ROWS,
          metadata: METADATA,
          columnsByDataType: {wings: 'numerical'},
          removedRowsCount: 0,
        },
      })
    );

    await loadDataset('animals.csv', 'animals.json');

    expect(store.getState().dataset.columnsByDataType).not.toHaveProperty(
      'wings'
    );
  });

  test("locks the dataset's default label when no label is set", async () => {
    expect((await load({hideSelectLabel: true})).labelColumn).toBe('animal');
  });

  test('locks the label in place of the default', async () => {
    expect(
      (await load({hideSelectLabel: true, label: 'legs'})).labelColumn
    ).toBe('legs');
  });

  test('leaves the label unset when neither the mode nor the lock sets it', async () => {
    expect((await load({})).labelColumn).toBeUndefined();
  });

  test('drops the label from the features', async () => {
    expect(await load({label: 'animal', features: ['animal', 'legs']})).toEqual(
      {labelColumn: 'animal', selectedFeatures: ['legs']}
    );
  });

  test('skips and reports columns that are not selectable', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(
      await load({label: 'name', features: ['name', 'legs', 'wings']})
    ).toEqual({labelColumn: undefined, selectedFeatures: ['legs']});
    expect(consoleError.mock.calls.map(([message]) => message)).toEqual([
      'AI Lab mode: "name" is not a selectable column of this dataset.',
      'AI Lab mode: "wings" is not a selectable column of this dataset.',
      'AI Lab mode: "name" is not a selectable column of this dataset.',
    ]);
  });

  /*
    `animal` is typed and has few enough values to train on, so only the id
    rule keeps it out.
  */
  describe('the id column is never a preset', () => {
    beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

    test('when the level names it', async () => {
      expect(
        await load({idColumn: 'animal', features: ['animal', 'legs']})
      ).toEqual({labelColumn: undefined, selectedFeatures: ['legs']});
    });

    test('when the dataset names it', async () => {
      fetchMetadata.mockResolvedValue({
        ok: true,
        metadata: {...METADATA, defaultIdColumn: 'animal'},
      });

      expect(await load({label: 'animal', features: ['legs']})).toEqual({
        labelColumn: undefined,
        selectedFeatures: ['legs'],
      });
    });
  });
});

describe('a dataset that will not load', () => {
  test('reports a short table as a failed load, not a bad upload', async () => {
    fetchCsv.mockResolvedValue({ok: false, reason: 'tooFewRows'});

    await loadDataset('animals.csv', 'animals.json');

    expect(store.getState().invalidData).toBe('loadFailed');
    expect(store.getState().dataset).toBeUndefined();
  });

  test('reports a failure when the metadata cannot be read', async () => {
    fetchMetadata.mockResolvedValue({ok: false, reason: 'loadFailed'});

    await loadDataset('animals.csv', 'animals.json');

    expect(store.getState().invalidData).toBe('loadFailed');
    expect(store.getState().dataset).toBeUndefined();
  });
});

describe('a load a newer one has superseded', () => {
  const supersede = async result => {
    let finish;
    fetchCsv.mockReturnValue(new Promise(resolve => (finish = resolve)));
    const loading = loadDataset('animals.csv', 'animals.json');
    invalidatePendingDatasetLoads();
    finish(result);
    await loading;
  };

  test('writes no dataset', async () => {
    await supersede(ROWS_READ);

    expect(store.getState().dataset).toBeUndefined();
  });

  test('reports no failure, which would outlive the load that replaced it', async () => {
    await supersede({ok: false, reason: 'tooFewRows'});

    expect(store.getState().invalidData).toBeUndefined();
  });
});

describe('loadUploadedDataset', () => {
  const file = {name: 'mine.csv'};

  test('reads the column types from the rows, having no metadata', async () => {
    await loadUploadedDataset(file);

    const {dataset} = store.getState();
    expect(dataset.rows).toEqual(ROWS);
    expect(dataset.columnsByDataType).toEqual({
      name: 'categorical',
      legs: 'numerical',
      animal: 'categorical',
    });
  });

  test("leaves the level's preset columns alone", async () => {
    store.dispatch(setMode({label: 'animal', features: ['legs']}));

    await loadUploadedDataset(file);

    expect(store.getState().presetColumns).toBeUndefined();
  });

  test('reports a failure the same way', async () => {
    parseCsvFile.mockResolvedValue({ok: false, reason: 'tooFewColumns'});

    await loadUploadedDataset(file);

    expect(store.getState().invalidData).toBe('tooFewColumns');
  });
});
