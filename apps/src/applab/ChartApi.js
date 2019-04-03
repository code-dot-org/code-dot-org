/**
 * @file Core implementation of Applab commands related to the Chart design element.
 *
 * For now, uses Google charts.
 * @see {GoogleChart}
 */
import * as utils from '../utils';
import GoogleChart from './GoogleChart';

/**
 * API for requesting/generating charts in Applab.
 */
export default class ChartApi {
  /**
   * @constructor
   * @param {Document} [docContext] - default is 'document'
   * @param [appStorage] - default is AppStorage
   */
  constructor(docContext, appStorage) {
    this.document_ = docContext || document;
    this.appStorage_ = appStorage || Applab.storage;

    /**
     * List of all warnings generated while performing operations through this
     * API instance.
     * @type {Error[]}
     */
    this.warnings = [];
  }

  /**
   * Record a runtime warning.
   * @param {string} warningMessage
   */
  warn(warningMessage) {
    this.warnings.push(new Error(warningMessage));
  }

  /**
   * Add warnings from an array to the ChartApi instance's warnings array.
   * @param {Error[]} newWarnings
   * @private
   */
  mergeWarnings_(newWarnings) {
    Array.prototype.push.apply(this.warnings, newWarnings);
  }

  // When adding a new type, provide an entry in the string enum (for clean code)
  // and an entry in the TypeNameToType map (allows us to easily remap different
  // implementations to the same type name).

  /** @enum {string} */
  static ChartType = {
    BAR: 'bar',
    PIE: 'pie',
    LINE: 'line',
    SCATTER: 'scatter'
  };

  /** @type {Object.<string, GoogleChart>} */
  static TypeNameToType = {
    bar: GoogleChart.MaterialBarChart,
    pie: GoogleChart.PieChart,
    line: GoogleChart.MaterialLineChart,
    scatter: GoogleChart.MaterialScatterChart
  };

  /**
   * Get an array of all the chart type strings.
   * @returns {string[]}
   */
  static getChartTypeNames() {
    return Object.getOwnPropertyNames(ChartApi.TypeNameToType);
  }

  /**
   * @param {ChartType} chartType
   * @returns {boolean} TRUE if the given type is in the known list of chart types.
   */
  static supportsType(chartType) {
    return ChartApi.getChartTypeNames().indexOf(chartType.toLowerCase()) !== -1;
  }

  /**
   * @return {string[]} a quoted, sorted list of chart types for use in the
   *         Droplet parameter dropdown.
   */
  static getChartTypeDropdown() {
    return ChartApi.getChartTypeNames()
      .map(utils.quote)
      .sort();
  }

  /**
   * Render a chart into an Applab chart element.
   * @param {string} chartId - ID of the destination chart element.
   * @param {ChartType} chartType - Desired chart type.
   * @param {Object[]} chartData - Data to populate the chart.
   * @param {Object} options - passed through to the API.
   * @returns {Promise} which resolves when the chart has been rendered, or
   *          rejects if there are any problems along the way.
   */
  async drawChart(chartId, chartType, chartData, options) {
    const chart = this.createChart_(chartId, chartType);
    const columns = ChartApi.inferColumnsFromRawData(chartData);
    await chart.drawChart(chartData, columns, options);
    this.mergeWarnings_(chart.warnings);
  }

  /**
   * Render a chart into an Applab chart element using data from an AppStorage
   * API table.
   * @param {string} chartId - ID of the destination chart element.
   * @param {ChartType} chartType - Desired chart type.
   * @param {string} tableName - AppStorage API table name to source data from
   *                 for the chart.
   * @param {string[]} columns - Columns to use from the table data for the chart,
   *        in order (required order dependent on chart type).
   * @param {Object} options - passed through to the API.
   * @returns {Promise} resolves when the chart has been rendered, or rejects if
   *          there are any problems along the way.
   */
  async drawChartFromRecords(chartId, chartType, tableName, columns, options) {
    const chart = this.createChart_(chartId, chartType);
    const results = await Promise.all([
      chart.loadDependencies(),
      this.fetchTableData_(tableName)
    ]);
    const tableData = results[1];
    const columnsInTable = ChartApi.inferColumnsFromRawData(tableData);
    columns = this.guessColumnsIfNecessary(columns, columnsInTable, tableName);
    this.warnIfColumnsNotFound(columns, columnsInTable, tableName);
    await chart.drawChart(tableData, columns, options);
    this.mergeWarnings_(chart.warnings);
  }

  /**
   * Generates a warning for every requested column that is not found in the
   * columnsInTable collection.
   * @param {string[]} requestedColumns
   * @param {string[]} columnsInTable
   * @param {string} tableName
   */
  warnIfColumnsNotFound(requestedColumns, columnsInTable, tableName) {
    // Check that specified columns exist in raw data
    requestedColumns.forEach(columnName => {
      if (columnsInTable.indexOf(columnName) === -1) {
        this.warn(
          'Column ' +
            utils.quote(columnName) +
            ' not found in table ' +
            utils.quote(tableName) +
            '.'
        );
      }
    });
  }

  /**
   * If enough columns are requested, this function just returns the requested
   * columns.  Otherwise it guesses two columns from the columnsInTable if it
   * can, generating appropriate warnings.  If there are not enough columns in
   * the table either, throws an error since we cannot proceed.
   * @param {string[]} requestedColumns
   * @param {string[]} columnsInTable
   * @param {string} tableName
   * @returns {string[]}
   * @throws {Error} if not enough columns and unable to guess columns.
   */
  guessColumnsIfNecessary(requestedColumns, columnsInTable, tableName) {
    if (!requestedColumns || requestedColumns.length < 2) {
      this.warn('Not enough columns specified; expected at least 2.');

      if (columnsInTable.length === 0) {
        throw new Error(
          'No columns found in table ' +
            utils.quote(tableName) +
            '. Charts require at least 2 columns.'
        );
      } else if (columnsInTable.length < 2) {
        throw new Error(
          'Only found ' +
            columnsInTable.length +
            ' columns in table ' +
            utils.quote(tableName) +
            ': ' +
            columnsInTable.map(utils.quote).join(', ') +
            '. Charts require at least 2 columns.'
        );
      } else {
        // Take our best guess and continue
        requestedColumns = columnsInTable.slice(0, 2);
        this.warn(
          'Using columns ' +
            requestedColumns.map(utils.quote).join(' and ') +
            '.  Possible columns for table ' +
            utils.quote(tableName) +
            ' are ' +
            columnsInTable.map(utils.quote).join(', ') +
            '.'
        );
      }
    }
    return requestedColumns;
  }

  /**
   * Create a chart object of the requested type, for the requested target element.
   * @param {string} elementId
   * @param {string} typeName
   * @returns {GoogleChart}
   * @throws {Error} if target element or chart type are not found.
   * @private
   */
  createChart_(elementId, typeName) {
    const targetElement = this.getTargetElement_(elementId);
    const FoundType = ChartApi.getChartTypeByName_(typeName);
    return new FoundType(targetElement);
  }

  /**
   * Get the DOM Element with the given ID.
   * @param {string} elementId
   * @returns {Element}
   * @throws {Error} if the requested element is not found, or is not a div.
   * @private
   */
  getTargetElement_(elementId) {
    const targetElement = this.document_.getElementById(elementId);
    if (!targetElement || 'div' !== targetElement.tagName.toLowerCase()) {
      throw new Error(
        'Unable to render chart into element "' + elementId + '".'
      );
    }
    return targetElement;
  }

  /**
   * Get the constructor function for the requested chart type.
   * @param {string} typeName
   * @returns {GoogleChart}
   * @throws {Error} if requested type is not found/supported.
   * @private
   */
  static getChartTypeByName_(typeName) {
    if (typeof typeName !== 'string') {
      throw new Error('Unknown chart type.');
    }

    const type = ChartApi.TypeNameToType[typeName.toLowerCase()];
    if (!type) {
      throw new Error('Unsupported chart type "' + typeName + '".');
    }

    return type;
  }

  /**
   * Get all data from the requested table.
   * Wraps AppStorage.readRecords in an ES6 Promise interface.
   * @param {string} tableName
   * @returns {Promise}
   * @private
   */
  fetchTableData_(tableName) {
    return new Promise((resolve, reject) => {
      this.appStorage_.readRecords(tableName, {}, resolve, function(errorMsg) {
        reject(new Error(errorMsg));
      });
    });
  }

  /**
   * @param {Object[]} rawData
   * @returns {string[]} column names found as keys in the row objects in the
   *          rawData, (hopefully) in the order they were defined in the row
   *          objects.
   */
  static inferColumnsFromRawData(rawData) {
    return Object.getOwnPropertyNames(
      rawData.reduce(function(memo, row) {
        Object.getOwnPropertyNames(row).forEach(key => (memo[key] = true));
        return memo;
      }, {})
    );
  }
}
