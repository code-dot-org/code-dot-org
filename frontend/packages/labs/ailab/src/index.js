import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer, {
  setMode,
  setSelectedCSV,
  setSelectedJSON,
  setColumnsByDataType
} from "./redux";
import { allDatasets } from "./datasetManifest";
import { parseCSV } from "./csvReaderWrapper";
import { parseJSON } from "./jsonReaderWrapper";

export const store = createStore(rootReducer);

export const initAll = function(options) {
  // Handle an optional mode.
  const mode = options && options.mode;
  const saveTrainedModel = options && options.saveTrainedModel;
  store.dispatch(setMode(mode));
  processMode(mode);

  ReactDOM.render(
    <Provider store={store}>
      <App mode={mode} saveTrainedModel={saveTrainedModel} />
    </Provider>,
    document.getElementById("root")
  );
};

// Process an optional mode.
const processMode = mode => {
  const assetPath = global.__ml_playground_asset_public_path__;

  if (mode) {
    if (mode.id === "load_dataset") {
      const item = allDatasets.filter(item => {
        return item.id === mode.setId;
      })[0];
      store.dispatch(setSelectedCSV(assetPath + item.path));
      store.dispatch(setSelectedJSON(assetPath + item.metadataPath));
      parseCSV(assetPath + item.path, true, false);

      // Also retrieve model metadata and set column data types.
      parseJSON(assetPath + item.metadataPath, result => {
        for (const field of result.fields) {
          store.dispatch(setColumnsByDataType(field.id, field.type));
        }
      });
    }
  }
};
