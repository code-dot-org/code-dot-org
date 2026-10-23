import {parseCSV} from '@cdo/apps/ailab/engine/csvReaderWrapper';
import {parseJSON} from '@cdo/apps/ailab/engine/jsonReaderWrapper';
import {loadDataset} from '@cdo/apps/ailab/engine/loadDataset';
import {
  resetState,
  setColumnsByDataType,
  setImportedData,
  setImportedMetadata,
  setMode,
} from '@cdo/apps/ailab/engine/redux';
import {store} from '@cdo/apps/ailab/engine/store';

jest.mock('@cdo/apps/ailab/engine/csvReaderWrapper');
jest.mock('@cdo/apps/ailab/engine/jsonReaderWrapper');

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

let finishCSV;
let finishJSON;

beforeEach(() => {
  store.dispatch(resetState());
  parseCSV.mockImplementation(
    () =>
      new Promise(resolve => {
        finishCSV = () => {
          store.dispatch(setImportedData(ROWS, false));
          resolve();
        };
      })
  );
  parseJSON.mockImplementation(
    () =>
      new Promise(resolve => {
        finishJSON = () => {
          store.dispatch(setImportedMetadata(METADATA));
          for (const field of METADATA.fields) {
            store.dispatch(setColumnsByDataType(field.id, field.type));
          }
          resolve();
        };
      })
  );
});

afterEach(() => jest.restoreAllMocks());

async function load(mode) {
  store.dispatch(setMode(mode));
  const loaded = loadDataset('animals.csv', 'animals.json');
  finishCSV();
  finishJSON();
  await loaded;
  const {labelColumn, selectedFeatures} = store.getState().presetColumns;
  return {labelColumn, selectedFeatures};
}

describe('loadDataset', () => {
  test.each([
    ['rows', () => finishCSV(), () => finishJSON()],
    ['metadata', () => finishJSON(), () => finishCSV()],
  ])(
    'waits for the metadata and the rows when the %s arrive first',
    async (_, finishFirst, finishSecond) => {
      store.dispatch(setMode({label: 'animal', features: ['legs']}));
      const loaded = loadDataset('animals.csv', 'animals.json');

      finishFirst();
      await Promise.resolve();
      finishSecond();
      await loaded;
      expect(store.getState().presetColumns).toEqual({
        labelColumn: 'animal',
        selectedFeatures: ['legs'],
      });
    }
  );

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
});
