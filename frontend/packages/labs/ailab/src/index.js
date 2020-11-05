import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { Provider } from "react-redux";
import { createStore} from "redux";
import rootReducer, { setMode, setSelectedCSV } from "./redux";
import { allDatasets } from "./datasetManifest";
import { parseCSV } from "./csvReaderWrapper";

export const store = createStore(rootReducer);

export const initAll = function(options) {
  const mode = options && options.mode;

  setMode(mode);
  processMode(mode);

  ReactDOM.render(
    <Provider store={store}>
      <App mode={mode}/>
    </Provider>,
    document.getElementById("root")
  );
};

const processMode = mode => {
  const assetPath = global.__ml_playground_asset_public_path__;

  if (mode.id === "load_dataset") {
    const path = allDatasets.filter(item => {return item.id === mode.setId})[0].path;
    store.dispatch(setSelectedCSV(assetPath + path));
    parseCSV(assetPath + path, true);
  }
};
