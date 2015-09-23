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
 * @param {function} onSuccess
 * @param {function} onError
 */
ChartApi.prototype.drawChart = function (chartId, chartType, tableName, columns) {
  var targetElement = document.getElementById(chartId);
  var options = {
    chart: {
      title: 'Company Performance',
      subtitle: 'Sales, Expenses, and Profit: 2014-2017',
    },
    bars: 'horizontal' // Required for Material Bar Charts.
  };
  this.loadApiForType(chartType, function () {
    this.buildDataTable(tableName, columns, function (data) {
      var Chart = ChartApi.getConstructorForType(chartType);
      var chart = new Chart(targetElement);
      chart.draw(data, options);
    }.bind(this));
  }.bind(this));
};

/**
 * Dynamically load needed dependencies for the requested chart type.
 *
 * @param {ChartType} chartType - The requested chart type, which determines
 *        which packages we need to load.
 * @param {function} onLoad - called after loading required packages from the
 *        google.visualization library.
 * @throws {Error} if dependency loading fails.
 */
ChartApi.prototype.loadApiForType = function (chartType, onLoad) {
  try {
    // Dynamically load the google.visualization library,
    //   at the latest stable version (that's what '1' means)
    //   plus any needed packages for the requested chart type
    //   then call onLoad()
    google.load('visualization', '1', {
      packages: ChartApi.getDependenciesForType(chartType),
      callback: onLoad
    });
    // google.load caches loaded packages internally, so we can call this
    // on every drawChart request without incurring unnecessary load time.
    //    https://developers.google.com/chart/interactive/docs
    //           /library_loading_enhancements#advanced-library-loading
  } catch (e) {
    throw new Error('Unable to load Google Charts API; ' + e.message);
  }
};

ChartApi.prototype.buildDataTable = function (tableName, columns, onSuccess) {
  // TODO: Actually retrieve data from data API!
  // Validate table with given name exists (later!)
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  data.addColumn('number', 'Popularity');
  data.addColumn('number', 'Value');
  data.addRows([
    ['Mushrooms', 3, 1, 1],
    ['Onions', 1, 2, 3]
  ]);
  onSuccess(data);
};
