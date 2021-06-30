import Papa from "papaparse";
import { store } from "./index.js";
import {
  setImportedData,
  setInvalidData,
  setColumnsByDataType,
  setRemovedRowsCount
} from "./redux";
import { containsOnlyNumbers } from "./helpers/columnDetails.js";
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

const cleanData = (data) => {
  var cleanedData = []

  for (var row of data) {
    var cleanedRow = getCleanedRow(row);
    if (cleanedRow !== null) {
      cleanedData.push(cleanedRow);
    }
  }

  return cleanedData;
}

const getCleanedRow = (row) => {
  for (var column in row) {
    var cellValue = row[column];

    if (!isCellValid(cellValue)) {
      return null;
    }

    row[column] = cellValue.trim();
  }

  return row;
}

const isCellValid = (cell) => {
  return cell !== undefined && cell !== "";
}

const updateData = (result, useDefaultColumnDataType, userUploadedData) => {
  var data = result.data;
  var cleanedData = cleanData(data);
  countRemovedRows(data, cleanedData);
  store.dispatch(setImportedData(cleanedData, userUploadedData));
  if (useDefaultColumnDataType) {
    setDefaultColumnDataType(cleanedData);
  }

  if (cleanedData.length < 2) {
    store.dispatch(setInvalidData("tooFewRows"));
  } else if (Object.keys(cleanedData[0]).length < 2) {
    store.dispatch(setInvalidData("tooFewColumns"));
  }
}

const countRemovedRows = (originalData, cleanedData) => {
  var removedRowsCount = originalData.length - cleanedData.length;
  store.dispatch(setRemovedRowsCount(removedRowsCount));
}

const setDefaultColumnDataType = data => {
  const columns = Object.keys(data[0]);
  for (let column of columns) {
    if (containsOnlyNumbers(data, column)) {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.NUMERICAL))
    } else {
      store.dispatch(setColumnsByDataType(column, ColumnTypes.CATEGORICAL))
    }
  }
};
