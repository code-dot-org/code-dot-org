import { store } from "./index.js";
import {
  setImportedMetadata,
  setColumnsByDataType,
  setLabelColumn
} from "./redux";

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

  if (state.mode) {
    if (state.mode.hideSpecifyColunns) {
      for (const field of metadata.fields) {
        store.dispatch(setColumnsByDataType(field.id, field.type));
      }
    }

    if (state.mode.hideSelectLabel) {
      // Use the manifest's default label instead.
      store.dispatch(setLabelColumn(metadata.defaultLabelColumn));
    }
  }
};
