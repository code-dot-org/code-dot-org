import {parseCSV} from './csvReaderWrapper';
import {parseJSON} from './jsonReaderWrapper';
import {setPresetColumns} from './redux';
import {getSelectableColumns} from './selectors';
import {store} from './store';

export const loadDataset = async (
  csvPath: string,
  jsonPath: string
): Promise<void> => {
  await Promise.all([parseCSV(csvPath, true, false), parseJSON(jsonPath)]);
  applyModeColumns();
};

const applyModeColumns = (): void => {
  const state = store.getState();
  const {mode, metadata} = state;
  const selectableColumns = getSelectableColumns(state);
  const isSelectable = (column: string): boolean => {
    if (selectableColumns.includes(column)) {
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

  store.dispatch(
    setPresetColumns({
      labelColumn,
      // A column can't be both the label and a feature.
      selectedFeatures: labelColumn
        ? features?.filter(feature => feature !== labelColumn)
        : features,
    })
  );
};
