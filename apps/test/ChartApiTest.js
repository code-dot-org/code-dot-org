/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true
 */
'use strict';
/* global describe, beforeEach, it */

var assert = require('./util/testUtils').assert;
var ChartApi = require('@cdo/apps/applab/ChartApi');
var GoogleChart = require('@cdo/apps/applab/GoogleChart');
var Promise = require('es6-promise').Promise;

var fakeDiv = document.createElement('div');
var fakeImg = document.createElement('img');

/**
 * Fake a document context for testing.
 * @type {Document}
 */
var fakeDocument = {
  getElementById: function (id) {
    if (id === 'fakeDiv') {
      return fakeDiv;
    } else if (id === 'fakeImg') {
      return fakeImg;
    }
    return null;
  }
};

/**
 * Stub chart type for our fake google API.
 * @constructor
 */
var NullChart = function () {};
NullChart.convertOptions = function (x) { return x; };
NullChart.prototype.draw = function () {};

/**
 * Fake the google loader/visualization API for testing.
 * @type {{}}
 */
var fakeGoogle = {
  load: function (library, version, options) {
    if (options && options.callback) {
      options.callback();
    }
  },
  charts: {
    Bar: NullChart,
    Line: NullChart,
    Scatter: NullChart
  },
  visualization: {
    arrayToDataTable: function (array) { return array; },
    PieChart: NullChart
  }
};

var FakeAppStorage = function () {
  this.fakeRecords = [];
};
FakeAppStorage.prototype.readRecords = function (table, filter, onSuccess) {
  onSuccess(this.fakeRecords);
};

describe("GoogleChart", function () {
  it("extracts all columns from data", function () {
    GoogleChart.lib = fakeGoogle;
    var rawData = [
      {'x': 12},
      {'x': 10, 'y': 14},
      {'z': 144}
    ];
    assert.deepEqual(GoogleChart.inferColumnsFromRawData(rawData), ['x', 'y', 'z']);
  });
});

describe("ChartApi", function () {
  var ChartType = ChartApi.ChartType;
  var fakeAppStorage;

  beforeEach(function () {
    GoogleChart.lib = fakeGoogle;
    fakeAppStorage = new FakeAppStorage();
  });

  describe("ChartType enum", function () {

    it("only contains supported types", function () {
      Object.getOwnPropertyNames(ChartType).forEach(function (key) {
        var typeName = ChartType[key];
        assert.isTrue(ChartApi.supportsType(typeName), "Supports type '" +
            typeName + "'.");
      });
    });

    it("contains all supported types", function () {
      var supportedTypes = Object.getOwnPropertyNames(ChartApi.TypeNameToType);
      var enumTypeNames = Object.getOwnPropertyNames(ChartType).map(function (key) {
        return ChartType[key];
      });

      supportedTypes.forEach(function (typeName) {
        assert.isTrue(enumTypeNames.some(function (enumName) {
          return enumName === typeName;
        }), "Found supported type '" + typeName + "' in enum.");
      });
    });
  });

  it("supports type BAR", function () {
    assert.isTrue(ChartApi.supportsType(ChartApi.ChartType.BAR));
    assert.isTrue(ChartApi.supportsType('BAR'));
    assert.isTrue(ChartApi.supportsType('Bar'));
    assert.isTrue(ChartApi.supportsType('bar'));
  });

  it("supports type PIE", function () {
    assert.isTrue(ChartApi.supportsType(ChartApi.ChartType.PIE));
    assert.isTrue(ChartApi.supportsType('PIE'));
    assert.isTrue(ChartApi.supportsType('Pie'));
    assert.isTrue(ChartApi.supportsType('pie'));
  });

  it("supports type LINE", function () {
    assert.isTrue(ChartApi.supportsType(ChartApi.ChartType.LINE));
    assert.isTrue(ChartApi.supportsType('LINE'));
    assert.isTrue(ChartApi.supportsType('Line'));
    assert.isTrue(ChartApi.supportsType('line'));
  });

  it("supports type SCATTER", function () {
    assert.isTrue(ChartApi.supportsType(ChartApi.ChartType.SCATTER));
    assert.isTrue(ChartApi.supportsType('SCATTER'));
    assert.isTrue(ChartApi.supportsType('Scatter'));
    assert.isTrue(ChartApi.supportsType('scatter'));
  });

  it("quotes and alphabetizes types for dropdown", function () {
    assert.deepEqual(ChartApi.getChartTypeDropdown(), [
        '"bar"',
        '"line"',
        '"pie"',
        '"scatter"'
    ]);
  });

  describe("drawChartFromRecords", function () {
    var chartApi, result, rejection;

    beforeEach(function () {
      chartApi = new ChartApi(fakeDocument, fakeAppStorage);
      result = null;
      rejection = null;
    });

    function onResolve(r) {
      result = r;
    }

    function onReject(e) {
      rejection = e;
    }

    var assertWarns = function (chartApi, warningRegexp) {
      assert.isNull(rejection);
      var warningFound = chartApi.warnings.some(function (e) {
        return warningRegexp.test(e.message);
      });
      assert(warningFound, 'Expected warning ' +
          warningRegexp.toString() + "\n\Got warnings:\n" +
          chartApi.warnings.map(function (e) {
            return e.message;
          }).join("\n"));
    };

    var assertNotWarns = function (chartApi, warningRegexp) {
      assert.isNull(rejection);
      var warningFound = chartApi.warnings.some(function (e) {
        return warningRegexp.test(e.message);
      });
      assert(!warningFound, 'Expected no warning ' +
          warningRegexp.toString() + "\n\Got warnings:\n" +
          chartApi.warnings.map(function (e) {
            return e.message;
          }).join("\n"));
    };

    it("returns a Promise", function () {
      assert.instanceOf(chartApi.drawChartFromRecords(), Promise);
    });

    it ("rejects if element is not found", function (testDone) {
      chartApi.drawChartFromRecords('missingId')
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                'Unable to render chart into element "missingId".');
          }));
    });

    it ("rejects if element is wrong type", function (testDone) {
      chartApi.drawChartFromRecords('fakeImg')
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                'Unable to render chart into element "fakeImg".');
          }));
    });

    it ("rejects if chart type is not supported", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', 'badType')
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                'Unsupported chart type "badType".');
          }));
    });

    it ("rejects if no columns array provided", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable')
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                "Not enough columns for chart; expected at least 2.");
          }));
    });

    it ("rejects if zero columns provided", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable', [])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                'Not enough columns for chart; expected at least 2.');
          }));
    });

    it ("rejects if only one column provided", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable', ['column1'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.equal(
                rejection.message,
                'Not enough columns for chart; expected at least 2.');
          }));
    });

    it ("when fulfilled, makes API calls", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable', ['column1', 'column2'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assert.isNull(rejection);
          }));
    });

    it ("warns about empty dataset", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable',
          ['column1', 'column2'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertWarns(chartApi, /No data\./);
          }));
    });

    it ("does not warn about empty dataset when given data", function (testDone) {
      fakeAppStorage.fakeRecords = [
        { column1: 'Duke', column2: 'Earl' }
      ];
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable',
          ['column1', 'column2'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertNotWarns(chartApi, /No data\./);
          }));
    });

    it ("warns about empty column", function (testDone) {
      fakeAppStorage.fakeRecords = [
        { column1: 'Duke' }
      ];
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable',
          ['column1', 'column2'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertWarns(chartApi, /No data found for column/);
          }));
    });

    it ("does not warn about empty column if all columns have data", function (testDone) {
      fakeAppStorage.fakeRecords = [
        { column1: 'Duke', column2: 'Earl' }
      ];
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable',
          ['column1', 'column2'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertNotWarns(chartApi, /No data found for column/);
          }));
    });

    it ("pie charts warn about three columns", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.PIE, 'fakeTable',
          ['column1', 'column2', 'column3'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertWarns(chartApi, /Too many columns/);
          }));
    });

    it ("bar charts do not warn about three columns", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.BAR, 'fakeTable',
          ['column1', 'column2', 'column3'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertNotWarns(chartApi, /Too many columns/);
          }));
    });

    it ("line charts do not warn about three columns", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.LINE, 'fakeTable',
          ['column1', 'column2', 'column3'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertNotWarns(chartApi, /Too many columns/);
          }));
    });

    it ("scatter charts do not warn about three columns", function (testDone) {
      chartApi.drawChartFromRecords('fakeDiv', ChartType.SCATTER, 'fakeTable',
          ['column1', 'column2', 'column3'])
          .then(onResolve, onReject)
          .then(ensureDone(testDone, function () {
            assertNotWarns(chartApi, /Too many columns/);
          }));
    });
  });

  /**
   * Wrap set of assertions (work) and make sure testDone() gets called
   * no matter what.
   * Important for testing async operations.
   * @see https://mochajs.org/#asynchronous-code
   * @param {function} testDone - the mocha "done" callback
   * @param {function} work - our own test code
   * @returns {Function}
   */
  function ensureDone(testDone, work) {
    return function () {
      try {
        work();
        testDone();
      } catch (e) {
        return testDone(e);
      }
    };
  }
});
