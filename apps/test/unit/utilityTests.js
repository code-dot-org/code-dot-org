import {assert} from '../util/configuredChai';
var testUtils = require('./../util/testUtils');
var xml = require('@cdo/apps/xml');

testUtils.setupLocales();

var utils = require('@cdo/apps/utils');
var _ = require('lodash');
var mazeUtils = require('@cdo/apps/maze/mazeUtils');

describe("mazeUtils", function () {
  var cellId = mazeUtils.cellId;

  it("can generate the correct cellIds", function () {
    assert.equal(cellId('dirt', 0, 0), 'dirt_0_0');
    assert.equal(cellId('dirt', 2, 4), 'dirt_2_4');
    assert.equal(cellId('dirt', 1, 5), 'dirt_1_5');
    assert.equal(cellId('dirt', 3, 1), 'dirt_3_1');
  });
});
