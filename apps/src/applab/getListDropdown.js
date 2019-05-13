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
  for (let dataset of datasetLibrary.datasets) {
    if (`"${dataset.name}"` === tableName) {
      return dataset.columns.split(',');
    }
  }
  return [];
}
