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
      updateData(result, useDefaultColumnDataType, !download);
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

const trimWhiteSpaces = (row) => {
  var trimmedRows = {};
  for (var cellName in row) {
    if (typeof row[cellName] === 'string') {
      trimmedRows[cellName] = row[cellName].trim();
    } else {
      trimmedRows[cellName] = row[cellName]
    }
  }
  return trimmedRows;
}

const cleanData = (data) => {
  var filterValidData = data.filter(row => isRowValid(row));
  var cleanedData = filterValidData.map(row => trimWhiteSpaces(row));
  return cleanedData;
}

const countRemovedRows = (originalData, cleanedData) => {
  var removedRowsCount = originalData.length - cleanedData.length;
  store.dispatch(setRemovedRowsCount(removedRowsCount));
}

const updateData = (result, useDefaultColumnDataType, userUploadedData) => {
  var data = result.data;
  var cleanedData = cleanData(data);
  countRemovedRows(data, cleanedData);
  store.dispatch(setImportedData(cleanedData, userUploadedData));
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
