import Papa from "papaparse";
import { store } from "./index.js";
import {
  setImportedData,
  setColumnsByDataType,
  columnContainsOnlyNumbers
} from "./redux";
import { ColumnTypes } from "./constants.js";

export const parseCSV = (csvfile, download, useDefaultColumnDataType) => {
  Papa.parse(csvfile, {
    complete: result => {
      updateData(result, useDefaultColumnDataType);
    },
    header: true,
    download: download,
    skipEmptyLines: true
  });
};

const updateData = (result, useDefaultColumnDataType) => {
  var data = result.data;
  store.dispatch(setImportedData(data));
  if (useDefaultColumnDataType) {
    setDefaultColumnDataType(data);
  }
};

const setDefaultColumnDataType = data => {
  const columns = Object.keys(data[0]);
  for (let column of columns) {
    if (columnContainsOnlyNumbers(data, column)) {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    } else {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL))
    }
  }
};
