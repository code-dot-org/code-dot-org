'use strict';
/* global describe */
/* global beforeEach */
/* global it */
/* global $ */

var testUtils = require('../util/testUtils');
testUtils.setupLocale('netsim');
var assert = testUtils.assert;
var assertEqual = testUtils.assertEqual;
var NetSimTestUtils = require('../util/netsimTestUtils');
var fakeShard = NetSimTestUtils.fakeShard;
var assertTableSize = NetSimTestUtils.assertTableSize;

var NetSimVizElement = require('@cdo/apps/netsim/NetSimVizElement');

describe("NetSimVizElement", function () {

  describe("defaults", function () {
    var vizElement;

    beforeEach(function () {
      vizElement = new NetSimVizElement();
    });

    it ("has default properties", function () {
      assertEqual(0, vizElement.posX);
      assertEqual(0, vizElement.posY);
      assertEqual(1, vizElement.scale);
      assertEqual([], vizElement.tweens_);
      assertEqual(false, vizElement.isDying());
      assertEqual(false, vizElement.isDead());
    });

    it ("immediately creates SVG root element", function () {
      var root = vizElement.getRoot();
      assertEqual('[object SVGGElement]', root[0].toString());
    });
  });

});
