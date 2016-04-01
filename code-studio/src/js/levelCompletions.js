/* globals Handsontable */

/**
 * Shows the samplingMessage and completionTable DOM elements depending on the
 * parameters.
 *
 * @param {boolean} isSampled - whether Google Analytics sampled.
 * @param {boolean} startDatePresent - whether a start_date parameter was given.
 */
exports.hideAndShowDomElements = function(isSampled, startDatePresent) {
  if (isSampled) {
    $('#samplingMessage').show();
  }
  if (startDatePresent) {
    $('#completionTable').show();
  }
};

/**
 * Renders the Avg. Success Rate column, changing the background color depending
 * on the percentage.
 */
function successRateRenderer(
    instance, td, row, col, prop, value, cellProperties) {
  var conditions = [
      [0.7, '#00FF00'],
      [0.5, '#b4ff00'],
      [0.45, '#ccff00'],
      [0.4, '#ffff00'],
      [0.3, '#ffdf00'],
      [0.2, '#ff8100'],
      [0.15, '#ff9900'],
      [0.1, '#ff0000'],
      [0.05, '#a61c00'],
      [0, '#5b0f00']
  ];
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  var val = parseFloat(value);
  for(var i=0; i < conditions.length; i++) {
    if(val >= conditions[i][0]) {
      td.style.background = conditions[i][1];
      return;
    }
  }
}

/**
 * Renders the Avg. Unique Success Rate column, changing the background color
 * depending on the percentage.
 */
function uniqueSuccessRateRenderer(
    instance, td, row, col, prop, value, cellProperties) {
  var conditions = [
    [0.98, '#00FF00'],
    [0.95, '#94ff20'],
    [0.92, '#b5ff04'],
    [0.9, '#d7ff00'],
    [0.85, '#efff00'],
    [0.82, '#ffdf00'],
    [0.8, '#ff9900'],
    [0.75, '#ff6900'],
    [0.7, '#ff3a00'],
    [0, '#ff0000']
  ];
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  var val = parseFloat(value);
  for(var i=0; i < conditions.length; i++) {
    if(val >= conditions[i][0]) {
      td.style.background = conditions[i][1];
      return;
    }
  }
}

/**
 * Renders the Avg. Time on Page column, changing what percentage of the cell's
 * background is colored gray.
 */
function timeOnSiteRenderer(
    instance, td, row, col, prop, value, cellProperties) {
  var percent = 0;
  if(value) {
    var val = parseFloat(value);
    var minutes = Math.floor(val / 60);
    var seconds = val - minutes*60;
    value = ('0' + minutes).substr(-2) + ':' + ('0' + seconds).substr(-2);
    percent = Math.min(1, val / 600);
  }
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style['font-family'] = 'monospace';
  td.style['background'] = 'linear-gradient(90deg, silver '
      + percent*100 + '%, white 0%)';
}

/**
 * Populates the completionTable DOM element.
 */
exports.populateTable = function(headers, data) {
  $("#completionTable").handsontable({
    data: data,
    startRows: 10,
    startCols: 9,
    colHeaders: headers,
    colWidths: [200, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    stretchH: 'none',
    columnSorting: true,
    manualColumnResize: true,
    columns: [
      {
        data: 'Puzzle'
      },
      {
        data: "TotalAttempt",
        type: 'numeric'
      },
      {
        data: "TotalSuccess",
        type: 'numeric'
      },
      {
        data: "Avg Success Rate",
        type: 'numeric',
        format: '0.00%'
      },
      {
        data: "Avg attempts per completion",
        type: 'numeric',
        format: '0.00'
      },
      {
        data: "UniqueAttempt",
        type: 'numeric'
      },
      {
        data: "UniqueSuccess",
        type: 'numeric'
      },
      {
        data: "Perceived Dropout",
        type: 'numeric'
      },
      {
        data: "Avg Unique Success Rate",
        type: 'numeric',
        format: '0.00%'
      },
      {
        data: "timeOnSite"
      }
    ],
    cells: function(row, col, prop) {
      if(col == 3) {
        return {renderer: successRateRenderer};
      } else if (col == 8) {
        return {renderer: uniqueSuccessRateRenderer};
      } else if (col == 9) {
        return {renderer: timeOnSiteRenderer};
      }
      return {};
    }
  });
};
