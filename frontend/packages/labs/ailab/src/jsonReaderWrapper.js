import { store } from "./index.js";
import {
  setImportedMetadata,
  setColumnsByDataType,
  setLabelColumn
} from "./redux";
import { ColumnTypes } from "./constants.js";

export const parseJSON = jsonfile => {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", jsonfile, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status === 200) {
      updateData(rawFile.responseText);
    }
  };
  rawFile.send(null);
};

const updateData = result => {
  var metadata = JSON.parse(result);
  store.dispatch(setImportedMetadata(metadata));

  const state = store.getState();

  for (const field of metadata.fields) {
    // Use the metadata's column type if the user will not see the UI to select column type.
    // But set the column type to "other" if the user will see that UI, so that they are forced
    // to choose a type.
    const fieldType =
      state.mode && state.mode.hideSpecifyColumns
        ? field.type
        : ColumnTypes.OTHER;
    store.dispatch(setColumnsByDataType(field.id, fieldType));
  }

  if (state.mode && state.mode.hideSelectLabel) {
    // Use the manifest's default label instead.
    store.dispatch(setLabelColumn(metadata.defaultLabelColumn));
  }
};
