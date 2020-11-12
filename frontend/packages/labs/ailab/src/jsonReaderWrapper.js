import { store } from "./index.js";
import { setImportedMetadata } from "./redux";

export const parseJSON = (jsonfile, successCallback) => {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", jsonfile, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status === 200) {
      updateData(rawFile.responseText, successCallback);
    }
  }
  rawFile.send(null);
};

const updateData = (result, successCallback) => {
  var metadata = JSON.parse(result);
  store.dispatch(setImportedMetadata(metadata));
  successCallback(metadata);
};
