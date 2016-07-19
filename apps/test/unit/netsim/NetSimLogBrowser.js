/** @file NetSimLogBrowser tests */
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from '../../util/configuredChai';
// TODO: Figure out how to `import` these and have the require order work out.
var testUtils = require('../../util/testUtils');
testUtils.setupLocale('netsim');
var NetSimLogBrowser = require('@cdo/apps/netsim/NetSimLogBrowser');

describe('NetSimLogBrowser', function () {
  it('renders warning-free with the least possible parameters', function () {
    let shallowResult = shallowRender(
        <NetSimLogBrowser/>
    );
    expect(shallowResult).not.to.be.null;
  });
});

function shallowRender(component) {
  let renderer = ReactTestUtils.createRenderer();
  renderer.render(component);
  return renderer.getRenderOutput();
}
