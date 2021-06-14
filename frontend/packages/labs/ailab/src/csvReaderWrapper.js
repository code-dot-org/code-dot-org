import Papa from "papaparse";
import { store } from "./index.js";
import {
  setImportedData,
  setColumnsByDataType,
  setRemovedRowsCount
} from "./redux";
import { columnContainsOnlyNumbers } from "./helpers/columnDetails.js";
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

const updateData = (result, useDefaultColumnDataType) => {
  var data = result.data;
  var cleanedData = cleanData(data);
  countRemovedRows(data, cleanedData);
  store.dispatch(setImportedData(cleanedData));
  if (useDefaultColumnDataType) {
    setDefaultColumnDataType(cleanedData);
  }
}

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
