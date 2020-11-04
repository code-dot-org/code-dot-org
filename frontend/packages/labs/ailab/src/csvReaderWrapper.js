import Papa from "papaparse";
import { store } from "./index.js";
import { setImportedData, setColumnsByDataType } from "./redux";
import { ColumnTypes } from "./constants.js";

export const parseCSV = (csvfile, download) => {
  Papa.parse(csvfile, {
    complete: updateData,
    header: true,
    download: download,
    skipEmptyLines: true
  });
};

const updateData = result => {
  var data = result.data;
  store.dispatch(setImportedData(data));
  setDefaultColumnDataType(data);
};

const setDefaultColumnDataType = data => {
  Object.keys(data[0]).map(column =>
    store.dispatch(setColumnsByDataType(column, ColumnTypes.OTHER))
  );
};
