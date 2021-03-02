import Papa from "papaparse";
import { store } from "./index.js";
import { setImportedData, setColumnsByDataType } from "./redux";
import { ColumnTypes } from "./constants.js";

export const parseCSV = (csvfile, download, setColumnsToOther) => {
  Papa.parse(csvfile, {
    complete: (result) => {
      updateData(result, setColumnsToOther);
    },
    header: true,
    download: download,
    skipEmptyLines: true,
  });
};

const updateData = (result, setColumnsToOther) => {
  var data = result.data;

  store.dispatch(setImportedData(data));
  if (setColumnsToOther) {
    setDefaultColumnDataType(data);
  }
};

const setDefaultColumnDataType = (data) => {
  Object.keys(data[0]).map((column) =>
    store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL))
  );
};
