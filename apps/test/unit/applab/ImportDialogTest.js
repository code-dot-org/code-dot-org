import {expect} from '../../util/configuredChai';
import ReactTestUtils from 'react-addons-test-utils';
import React from 'react';

// TODO(pcardune): remove this when code studio and apps are merged
window.React = React;

var {ImportDialog} = require('@cdo/apps/applab/ImportDialog');

describe("Applab Screens ImportDialog component", function () {

  var renderer;

  beforeEach(() => {
    renderer = ReactTestUtils.createRenderer();
  });

  it("should initialize to the following", function () {
    renderer.render(<ImportDialog isOpen={false} handleClose={()=>null} />);
  });

});
