import datasetLibrary from '../code-studio/datasetLibrary.json';
import {getFirstParam} from '../dropletUtils';

export function getListColumnDropdown() {
  return function(aceEditor) {
    const tableName = getFirstParam('getList', this.parent, aceEditor);
    const columns = getColumnsForTable(tableName);
    const opts = [];
    columns.forEach(columnName =>
      opts.push({display: `"${columnName}"`, text: `"${columnName}"`})
    );
    return opts;
  };
}

function getColumnsForTable(tableName) {
  let dataset = datasetLibrary.datasets.find(d => `"${d.name}"` === tableName);
  if (dataset) {
    return dataset.columns.split(',');
  } else {
    return [];
  }
}

export var __TestInterface = {
  getColumnsForTable: getColumnsForTable
};
