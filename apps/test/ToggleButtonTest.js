/**
 * Created by brad on 2/22/16.
 */
var testUtils = require('./util/testUtils');
var assert = testUtils.assert;
window.React = require('react');
var ReactTestUtils = require('react-addons-test-utils');
window.$ = require('jquery');

describe('ToggleButton', function () {
  var ToggleButton = require('@cdo/apps/applab/ToggleButton.jsx');
  var renderer;

  beforeEach(function () {
    renderer = ReactTestUtils.createRenderer();
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
