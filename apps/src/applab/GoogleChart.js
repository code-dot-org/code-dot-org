/**
 * @file Wrapper around Google Charts API chart-drawing features
 *
 * @see https://developers.google.com/chart/
 */
// Strict linting: Absorb into global config when possible
/* jshint
 unused: true,
 eqeqeq: true,
 maxlen: 120
 */
'use strict';
/* global google, Promise */

require("babelify/polyfill"); // required for Promises in IE / Phantom
require('../utils');

/**
 * Abstract base type for Google Charts API charts.
 *
 * @example
 *   var chart = new PieChart(targetDiv);
 *   chart.drawChart(data, columns[, options]);
 *
 * May optionally call loadDependencies() step to facilitiate parallel async
 * loading with other resources.
 *
 * @param {Element} targetDiv
 * @constructor
 */
var GoogleChart = module.exports = function (targetDiv) {
  // Define this late so we can overwrite it in tests.
  if (!GoogleChart.lib) {
    GoogleChart.lib = google;
  }

  /** @private {Element} */
  this.targetDiv_ = targetDiv;

  /** @private {google.visualization.DataTable} */
  this.dataTable_ = null;

  /**
   * List of all warnings logged while performing operations with this chart
   * instance.
   * @type {Error[]}
   */
  this.warnings = [];
};

/**
 * Loads the required libraries for this particular chart type.
 * Safe to call multiple times - Google's loader caches dependencies.
 * @returns {Promise} that resolves when dependencies have been loaded.
 */
GoogleChart.prototype.loadDependencies = function () {
  return new Promise(function (resolve, reject) {
    try {
      GoogleChart.lib.load('visualization', '1', {
        packages: this.getDependencies(),
        callback: resolve
      });
    } catch (e) {
      // We catch and return a different error so that we don't surface Google
      // API errors to students.
      reject(new Error('Unable to load Charts API.  Please try again later.'));
    }
  }.bind(this));
};

/**
 * Renders the chart into the target container using the specified options.
 *
 *  @param {Object[]} rawData - data to display in chart, formatted as an array
 *        of objects where each object represents a row, and the object keys
 *        are column names.
 * @param {string[]} columnList - Ordered list of column names to use as source
 *        data for the chart.  Column names must match keys in rawData.
 * @param {Object} options - Plain options object that gets passed through to
 *        the Charts API.
 * @returns {Promise} that resolves when the chart has been rendered to the
 *          target container.
 */
GoogleChart.prototype.drawChart = function (rawData, columnList, options) {
  return this.loadDependencies().then(function () {
    this.verifyData_(rawData, columnList);
    var dataTable = GoogleChart.dataTableFromRowsAndColumns(rawData, columnList);
    return this.render_(dataTable, options);
  }.bind(this));
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 */
GoogleChart.prototype.getDependencies = function () {
  return ['corechart'];
};

/**
 * Pushes the provided warning message into a collection of warnings for this
 * chart, which can be parsed and displayed later.
 * @param {string} warningMessage
 */
GoogleChart.prototype.warn = function (warningMessage) {
  this.warnings.push(new Error(warningMessage));
};

/**
 * Makes sure data looks okay, throws errors and logs warnings as appropriate.
 * @param {string[]} columns
 * @param {Object[]} data
 * @private
 */
GoogleChart.prototype.verifyData_ = function (data, columns) {
  // Warn when no rows are present
  if (data.length === 0) {
    this.warn('No data.');
  }

  // Error when not enough columns are provided
  if (columns.length < 2) {
    throw new Error('Not enough columns for chart; expected at least 2.');
  }

  // Warn on empty columns?
  columns.forEach(function (colName) {
    var exists = data.some(function (row) {
      return row[colName] !== undefined;
    });
    if (!exists) {
      this.warn('No data found for column "' + colName + '".');
    }
  }.bind(this));
};

/**
 * @param {Object[]} rows - Rows as POJOs with keys.
 * @param {string[]} columns - Column names which must correspond to keys
 *        in the row objects.
 * @return {google.visualization.DataTable}
 */
GoogleChart.dataTableFromRowsAndColumns = function (rows, columns) {
  var dataArray = rows.map(function (row) {
    return columns.map(function (key) {
      return row[key];
    });
  });
  return GoogleChart.lib.visualization.arrayToDataTable([columns].concat(dataArray));
};

/* jshint unused: false */
/**
 * Internal 'abstract' method that subclasses should use to implement the actual
 * rendering step.
 *
 * @param {google.visualzation.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 */
GoogleChart.prototype.render_ = function (dataTable, options) {
  return Promise.reject(new Error('Rendering unimplemented for chart type.'));
};
/* jshint unused: true */

/**
 * Google Charts API Pie Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/piechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var PieChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
PieChart.inherits(GoogleChart);
GoogleChart.PieChart = PieChart;


PieChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.PieChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 *
 * @param {string[]} columns
 * @param {Object[]} data
 * @private
 * @override
 */
PieChart.prototype.verifyData_ = function (data, columns) {
  PieChart.superPrototype.verifyData_.call(this, data, columns);

  if (columns.length > 2) {
    this.warn('Too many columns for pie chart; only using the first 2.');
  }
};

/**
 * Google Charts API Bar Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/barchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var BarChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
BarChart.inherits(GoogleChart);
GoogleChart.BarChart = BarChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
BarChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.BarChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Bar Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /barchart#creating-material-bar-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialBarChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialBarChart.inherits(GoogleChart);
GoogleChart.MaterialBarChart = MaterialBarChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialBarChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Bar(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Bar.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialBarChart.prototype.getDependencies = function () {
  return ['bar'];
};

/**
 * Google Charts API Line Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/linechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var LineChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
LineChart.inherits(GoogleChart);
GoogleChart.LineChart = LineChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
LineChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.LineChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Line Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /linechart#creating-material-line-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialLineChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialLineChart.inherits(GoogleChart);
GoogleChart.MaterialLineChart = MaterialLineChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialLineChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Line(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Line.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialLineChart.prototype.getDependencies = function () {
  return ['line'];
};


/**
 * Google Charts API Scatter Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/scatterchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var ScatterChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
ScatterChart.inherits(GoogleChart);
GoogleChart.ScatterChart = ScatterChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
ScatterChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.visualization.ScatterChart(this.targetDiv_);
  apiChart.draw(dataTable, options);
  return Promise.resolve();
};

/**
 * Google Charts API Material Design Scatter Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery
 *      /scatterchart#creating-material-scatter-charts
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
var MaterialScatterChart = function (targetDiv) {
  GoogleChart.call(this, targetDiv);
};
MaterialScatterChart.inherits(GoogleChart);
GoogleChart.MaterialScatterChart = MaterialScatterChart;

/**
 * @param {google.visualization.DataTable} dataTable
 * @param {Object} options
 * @returns {Promise}
 * @private
 * @override
 */
MaterialScatterChart.prototype.render_ = function (dataTable, options) {
  var apiChart = new GoogleChart.lib.charts.Scatter(this.targetDiv_);
  // Material charts have a built-in options converter for now.
  var convertedOptions = GoogleChart.lib.charts.Scatter.convertOptions(options);
  apiChart.draw(dataTable, convertedOptions);
  return Promise.resolve();
};

/**
 * Array of packages the chart needs to load to render.
 * @returns {string[]}
 * @override
 */
MaterialScatterChart.prototype.getDependencies = function () {
  return ['scatter'];
};
