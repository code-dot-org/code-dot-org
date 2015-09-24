/**
 * @file Core implementation of Applab commands related to the Chart design element.
 *
 * Uses the Google Charts API.
 * @see https://developers.google.com/chart/
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 6,
 maxstatements: 200
 */
'use strict';
/* global google */

var AppStorage = require('./appStorage');
var Promise = require('es6-promise').Promise;

var ChartApi = module.exports = function () {
};

/** @enum {string} */
ChartApi.ChartType = {
  BAR: 'bar',
  PIE: 'pie',
  LINE: 'line',
  SCATTER: 'scatter'
};

/**
 * @param {ChartType} chartType
 * @returns {string[]} A list of google.visualization package dependencies
 *          required to load the given chart type.
 * @throws {Error} if no dependencies are defined for the given chart type.
 */
ChartApi.getDependenciesForType = function (chartType) {
  switch (chartType) {
    case ChartApi.ChartType.BAR:
      // material design; use 'corechart' for standard
      return ['bar'];
    case ChartApi.ChartType.PIE:
      return ['corechart'];
    case ChartApi.ChartType.LINE:
      // material design: use 'corechart' for standard
      return ['line'];
    case ChartApi.ChartType.SCATTER:
      // material design: use 'corechart' for standard
      return ['scatter'];
  }
  throw new Error('Package dependencies are not defined for chart type "' +
      chartType  + '".');
};

/**
 * @param {ChartType} chartType
 * @returns {function} A constructor function for the requested chart type.
 * @throws {Error} if no dependencies are defined for the given chart type.
 */
ChartApi.getConstructorForType = function (chartType) {
  switch (chartType) {
    case ChartApi.ChartType.BAR:
      // material design; alt. google.visualization.BarChart
      return google.charts.Bar;
    case ChartApi.ChartType.PIE:
      return google.visualization.PieChart;
    case ChartApi.ChartType.LINE:
      // material design; alt. google.visualization.LineChart
      return google.charts.Line;
    case ChartApi.ChartType.SCATTER:
      // material design; alt. google.visualization.ScatterChart
      return google.charts.Scatter;
  }
  throw new Error('Constructor is not defined for chart type "' +
      chartType  + '".');
};

/**
 * Get an array of all the chart type strings.
 * @returns {string[]}
 */
ChartApi.getChartTypes = function () {
  return Object.getOwnPropertyNames(ChartApi.ChartType).map(function (key) {
    return ChartApi.ChartType[key];
  });
};

/**
 * @param {ChartType} chartType
 * @returns {boolean} TRUE if the given type is in the known list of chart types.
 */
ChartApi.supportsType = function (chartType) {
  return ChartApi.getChartTypes().indexOf(chartType) !== -1;
};

/**
 * @return {string[]} a quoted, sorted list of chart types for use in the
 *         Droplet parameter dropdown.
 */
ChartApi.getChartTypeDropdown = function () {
  return ChartApi.getChartTypes().map(quote).sort();
};

function quote(str) {
  return '"' + str + '"';
}

/**
 * @param {string} chartId
 * @param {ChartType} chartType
 * @param {string} tableName
 * @param {string[]} columns
 * @param {Object} options
 * @returns {Promise} resolves to an array of warnings (hopefully empty) or
 *          rejects with a single Error.
 */
ChartApi.prototype.drawChartFromRecords = function (chartId, chartType,
    tableName, columns, options) {
  var warnings = [];

  // Ensure target element exists and is usable.
  var targetElement = document.getElementById(chartId);
  if (!targetElement || 'div' !== targetElement.tagName.toLowerCase()) {
    return Promise.reject(new Error('Unable to render chart into element "' +
        chartId + '".'));
  }

  // Ensure chart type is currently supported
  if (!ChartApi.supportsType(chartType)) {
    return Promise.reject(new Error('Unsupported chart type "' + chartType + '".'));
  }

  // Ensure sufficient columns for chart type
  var minimumColumnsForType = 2;
  if (columns.length < minimumColumnsForType) {
    return Promise.reject(new Error('Not enough columns defined for chart type "' +
        chartType + '"; expected at least ' + minimumColumnsForType + '.'));
  }

  // Warn if provided more columns than chart type can use
  var maxColumnsForType = 2;
  if (columns.length > maxColumnsForType) {
    warnings.push(new Error('Provided ' + columns.length +
        ' columns but chart type "' + chartType + '" can only use up to ' +
        maxColumnsForType + '.'));
  }

  // Passed all the pre-command validation, let's get to work:
  //   1. In parallel:
  //     - Load required chart libraries.
  //     - Fetch data from storage table.
  //   2. Wait for both of the above tasks to complete.
  //   3. Convert received data to the chart API format.
  //   4. Render the chart.
  // Note any exceptions thrown
  return Promise.all([
    loadApiForType(chartType),
    fetchTableData(tableName)
  ]).then(function (resultsArray) {
    var rawData = resultsArray[1];

    var Chart = ChartApi.getConstructorForType(chartType);

    // Do some validation on data returned by query
    if (rawData.length === 0) {
      warnings.push(new Error('No rows returned for table "' + tableName + '".'));
    } else {
      columns.forEach(function (columnName) {
        var existsInSomeRow = rawData.some(function (row) {
          return row.hasOwnProperty(columnName);
        });

        if (!existsInSomeRow) {
          warnings.push(new Error('Column "' + columnName +
              '" not found in table "' + tableName + '".'));
        }
      });
    }

    // If possible, convert the options object for better compatability with new
    // material design charts.
    if ('function' === typeof Chart.convertOptions) {
      options = Chart.convertOptions(options);
    }

    // Finally, render the chart
    var dataTable = rawDataToDataTable(rawData, columns);
    var chart = new Chart(targetElement);
    chart.draw(dataTable, options);

    // Pass any warnings back along with the resolved promise.
    return Promise.resolve(warnings);
  });
};

/**
 * Dynamically load needed dependencies for the requested chart type.
 *
 * @param {ChartType} chartType - The requested chart type, which determines
 *        which packages we need to load.
 * @returns {Promise}
 */
var loadApiForType = function (chartType) {
  return new Promise(function (resolve, reject) {
    try {
      // Dynamically load the google.visualization library,
      //   at the latest stable version (that's what '1' means)
      //   plus any needed packages for the requested chart type
      //   then call onLoad()
      google.load('visualization', '1', {
        packages: ChartApi.getDependenciesForType(chartType),
        callback: resolve
      });
      // google.load caches loaded packages internally, so we can call this
      // on every drawChart request without incurring unnecessary load time.
      //    https://developers.google.com/chart/interactive/docs
      //           /library_loading_enhancements#advanced-library-loading
    } catch (e) {
      reject(new Error('Unable to load Charts API.  Please try again later.'));
    }
  });
};

/**
 * Get all data from the requested table.
 * Wraps AppStorage.readRecords in an ES6 Promise interface.
 * @param {string} tableName
 * @returns {Promise}
 */
var fetchTableData = function (tableName) {
  return new Promise(function (resolve, reject) {
    AppStorage.readRecords(tableName, {}, resolve, function (errorMsg) {
      reject(new Error(errorMsg));
    });
  });
};

/**
 * Convert table data from the format returned by the AppStorage API to
 * a google.visualization DataTable filtered to the requested columns.
 * @param {Object[]} rawData
 * @param {string[]} columns - must correspond to keys in rawData rows.
 * @returns {google.visualization.DataTable}
 */
var rawDataToDataTable = function (rawData, columns) {
  var dataArray = rawData.map(function (row) {
    return columns.map(function (key) {
      return row[key];
    });
  });
  return google.visualization.arrayToDataTable([columns].concat(dataArray));
};
