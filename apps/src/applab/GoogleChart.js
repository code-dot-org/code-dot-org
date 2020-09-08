/**
 * @file Wrapper around Google Charts API chart-drawing features
 *
 * @see https://developers.google.com/chart/
 */
/* global google, Promise */

require('../utils'); // Provides Function.prototype.inherits

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
export default class GoogleChart {
  constructor(targetDiv) {
    // Define this late so we can overwrite it in tests.
    if (!GoogleChart.lib) {
      GoogleChart.lib = google;
    }

    /** @private {Element} */
    this.targetDiv_ = targetDiv;

    /**
     * List of all warnings logged while performing operations with this chart
     * instance.
     * @type {Error[]}
     */
    this.warnings = [];
  }

  /**
   * Loads the required libraries for this particular chart type.
   * Safe to call multiple times - Google's loader caches dependencies.
   * @returns {Promise} that resolves when dependencies have been loaded.
   */
  loadDependencies() {
    return new Promise((resolve, reject) => {
      try {
        GoogleChart.lib.load('visualization', '1', {
          packages: this.getDependencies(),
          callback: resolve
        });
      } catch (e) {
        // We catch and return a different error so that we don't surface Google
        // API errors to students.
        reject(
          new Error('Unable to load Charts API.  Please try again later.')
        );
      }
    });
  }

  /**
   * Renders the chart into the target container using the specified options.
   *
   *  @param {Object[]} rawData - data to display in chart, formatted as an array
   *        of objects where each object represents a row, and the object keys
   *        are column names.
   * @param {string[]} columnList - Ordered list of column names to use as source
   *        data for the chart.  Column names must match keys in rawData.
   * @param {Object} options - Optional plain options object that gets passed through to
   *        the Charts API.
   * @returns {Promise} that resolves when the chart has been rendered to the
   *          target container.
   */
  async drawChart(rawData, columnList, options = {}) {
    await this.loadDependencies();

    this.verifyData_({data: rawData, columns: columnList});
    const dataTable = GoogleChart.dataTableFromRowsAndColumns(
      rawData,
      columnList
    );
    this.render_(dataTable, options);
  }

  /**
   * Array of packages the chart needs to load to render.
   * @returns {string[]}
   */
  getDependencies() {
    return ['corechart'];
  }

  /**
   * Pushes the provided warning message into a collection of warnings for this
   * chart, which can be parsed and displayed later.
   * @param {string} warningMessage
   */
  warn(warningMessage) {
    this.warnings.push(new Error(warningMessage));
  }

  /**
   * Makes sure data looks okay, throws errors and logs warnings as appropriate.
   * @param {Object} options
   * @param {Object[]} options.data
   * @param {string[]} options.columns
   * @param {number} options.minColumns
   * @param {number} options.maxColumns
   * @private
   */
  verifyData_(options) {
    let {data, columns, minColumns = 2, maxColumns} = options;

    // Warn when no rows are present
    if (data.length === 0) {
      this.warn('No data.');
    }

    if (maxColumns && columns.length > maxColumns) {
      this.warn(
        `Too many columns for chart; only using the first ${maxColumns}.`
      );
    }

    // Error when not enough columns are provided
    if (columns.length < minColumns) {
      throw new Error(
        `Not enough columns for chart; expected at least ${minColumns}.`
      );
    }

    // Warn on empty columns?
    columns.forEach(colName => {
      const exists = data.some(row => row[colName] !== undefined);
      if (!exists) {
        this.warn('No data found for column "' + colName + '".');
      }
    });
  }

  /**
   * @param {Object[]} rows - Rows as POJOs with keys.
   * @param {string[]} columns - Column names which must correspond to keys
   *        in the row objects.
   * @return {google.visualization.DataTable}
   */
  static dataTableFromRowsAndColumns(rows, columns) {
    const dataArray = rows.map(row => columns.map(key => row[key]));
    const columnLabels = columns.map(column => ({label: column}));
    return GoogleChart.lib.visualization.arrayToDataTable(
      [columnLabels].concat(dataArray)
    );
  }

  /**
   * Internal 'abstract' method that subclasses should use to implement the actual
   * rendering step.
   *
   * @param {google.visualzation.DataTable} dataTable
   * @param {Object} options
   * @private
   */
  render_(dataTable, options) {
    throw new Error('Rendering unimplemented for chart type.');
  }
}

/**
 * Google Charts API Pie Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/piechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
class PieChart extends GoogleChart {
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.visualization.PieChart(
      this.targetDiv_
    );
    apiChart.draw(dataTable, options);
  }

  /**
   *
   * @param {Object} options
   * @private
   * @override
   */
  verifyData_(options) {
    options.minColumns = 2;
    options.maxColumns = 2;
    super.verifyData_(options);
  }
}
GoogleChart.PieChart = PieChart;

class Histogram extends GoogleChart {
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.visualization.Histogram(
      this.targetDiv_
    );
    apiChart.draw(dataTable, options);
  }

  verifyData_(options) {
    options.minColumns = 1;
    options.maxColumns = 1;
    super.verifyData_(options);
  }
}
GoogleChart.Histogram = Histogram;

/**
 * Google Charts API Bar Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/barchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
class BarChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.visualization.BarChart(
      this.targetDiv_
    );
    apiChart.draw(dataTable, options);
  }
}
GoogleChart.BarChart = BarChart;

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
class MaterialBarChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.charts.Bar(this.targetDiv_);
    // Material charts have a built-in options converter for now.
    const convertedOptions = GoogleChart.lib.charts.Bar.convertOptions(options);
    apiChart.draw(dataTable, convertedOptions);
  }

  /**
   * Array of packages the chart needs to load to render.
   * @returns {string[]}
   * @override
   */
  getDependencies() {
    return ['bar'];
  }
}
GoogleChart.MaterialBarChart = MaterialBarChart;

/**
 * Google Charts API Line Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/linechart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
class LineChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.visualization.LineChart(
      this.targetDiv_
    );
    apiChart.draw(dataTable, options);
  }
}
GoogleChart.LineChart = LineChart;

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
class MaterialLineChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.charts.Line(this.targetDiv_);
    // Material charts have a built-in options converter for now.
    const convertedOptions = GoogleChart.lib.charts.Line.convertOptions(
      options
    );
    apiChart.draw(dataTable, convertedOptions);
  }

  /**
   * Array of packages the chart needs to load to render.
   * @returns {string[]}
   * @override
   */
  getDependencies() {
    return ['line'];
  }
}
GoogleChart.MaterialLineChart = MaterialLineChart;

/**
 * Google Charts API Scatter Chart
 *
 * @see https://developers.google.com/chart/interactive/docs/gallery/scatterchart
 *
 * @param {Element} targetDiv
 * @constructor
 * @extends GoogleChart
 */
class ScatterChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.visualization.ScatterChart(
      this.targetDiv_
    );
    apiChart.draw(dataTable, options);
  }
}
GoogleChart.ScatterChart = ScatterChart;

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
class MaterialScatterChart extends GoogleChart {
  /**
   * @param {google.visualization.DataTable} dataTable
   * @param {Object} options
   * @returns {Promise}
   * @private
   * @override
   */
  render_(dataTable, options) {
    const apiChart = new GoogleChart.lib.charts.Scatter(this.targetDiv_);
    // Material charts have a built-in options converter for now.
    const convertedOptions = GoogleChart.lib.charts.Scatter.convertOptions(
      options
    );
    apiChart.draw(dataTable, convertedOptions);
  }

  /**
   * Array of packages the chart needs to load to render.
   * @returns {string[]}
   * @override
   */
  getDependencies() {
    return ['scatter'];
  }
}
GoogleChart.MaterialScatterChart = MaterialScatterChart;
