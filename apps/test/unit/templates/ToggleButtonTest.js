import {assert} from '../../util/configuredChai';
var testUtils = require('./../../util/testUtils');
var React = require('react');
import ShallowRenderer from 'react-test-renderer/shallow';

describe('ToggleButton', function () {

  testUtils.setExternalGlobals();

  var ToggleButton = require('@cdo/apps/templates/ToggleButton');
  var renderer;

  beforeEach(function () {
    renderer = new ShallowRenderer();
  });

  it('generates a "button" element', function () {
    var button = React.createElement(ToggleButton, {
      active: true,
      onClick: function () {}
    }, 'buttonText');

    renderer.render(button);
    var result = renderer.getRenderOutput();

    assert.equal(result.type, 'button');
    assert.equal(result.props.children, 'buttonText');
  });

  it('applies id to the element if provided', function () {
    var button = React.createElement(ToggleButton, {
      id: 'buttonElementId',
      active: true,
      onClick: function () {}
    }, 'buttonText');

    renderer.render(button);
    var result = renderer.getRenderOutput();

    assert.equal(result.props.id, 'buttonElementId');
  });
});
