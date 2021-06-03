import Papa from "papaparse";
import { store } from "./index.js";
import {
  setImportedData,
  setRemovedRowsCount,
  setColumnsByDataType
} from "./redux";
import { ColumnTypes } from "./constants.js";

export const parseCSV = (csvfile, download, setColumnsToOther) => {
  Papa.parse(csvfile, {
    complete: result => {
      updateData(result, setColumnsToOther);
    },
    header: true,
    download: download,
    skipEmptyLines: true
  });
};

const isCellValid = (cell) => {
  return cell !== undefined && cell !== "";
}

const isRowValid = (row) => {
  var cells = Object.values(row);
  return cells.every(isCellValid)
}

const cleanData = (data) => {
  var cleanedData = data.filter(row => isRowValid(row));
  return cleanedData;
}

const countRemovedRows = (originalData, cleanedData) => {
  var removedRowsCount = originalData.length - cleanedData.length;
  store.dispatch(setRemovedRowsCount(removedRowsCount));
}

const updateData = (result, setColumnsToOther) => {
  var data = result.data;
  var cleanedData = cleanData(data);
  countRemovedRows(data, cleanedData);
  store.dispatch(setImportedData(cleanedData));
  if (setColumnsToOther) {
    setDefaultColumnDataType(cleanedData);
  }
};

const setDefaultColumnDataType = data => {
  Object.keys(data[0]).map(column =>
    store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL))
  );
};
