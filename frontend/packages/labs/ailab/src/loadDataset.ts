import {parseCSV} from './csvReaderWrapper';
import {parseJSON} from './jsonReaderWrapper';
import {setLabelColumn, setSelectedFeatures} from './redux';
import {getSelectableColumns} from './selectors';
import {store} from './store';

export const loadDataset = async (
  csvPath: string,
  jsonPath: string,
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
      `AI Lab mode: "${column}" is not a selectable column of this dataset.`,
    );
    return false;
  };

  // Features first, so setting the label drops it from the features.
  if (mode?.features) {
    store.dispatch(setSelectedFeatures(mode.features.filter(isSelectable)));
  }
  const label =
    mode?.label ??
    (mode?.hideSelectLabel ? metadata.defaultLabelColumn : undefined);
  if (label !== undefined && isSelectable(label)) {
    store.dispatch(setLabelColumn(label));
  }
};
