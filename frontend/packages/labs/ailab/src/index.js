import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer, {
  setMode,
  setCurrentPanel,
  setSelectedCSV,
  setSelectedJSON
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
    // Load a single dataset immediately.
    if (mode.datasets && mode.datasets.length === 1) {
      const item = allDatasets.filter(item => {
        return item.id === mode.datasets[0];
      })[0];
      store.dispatch(setSelectedCSV(assetPath + item.path));
      store.dispatch(setSelectedJSON(assetPath + item.metadataPath));
      parseCSV(assetPath + item.path, true, false);

      // Also retrieve model metadata and set column data types.
      parseJSON(assetPath + item.metadataPath);

      store.dispatch(setCurrentPanel("dataDisplay"));
    }
  } else {
    store.dispatch(setCurrentPanel("selectDataset"));
  }
};
