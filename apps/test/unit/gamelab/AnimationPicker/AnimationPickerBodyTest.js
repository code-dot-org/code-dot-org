import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import {expect} from '../../../util/configuredChai';

// We have to setup the gamelab locale before importing AnimationPickerBody
// TODO: Make testUtils exports Babel-ES6-friendly
let testUtils = require('../../../util/testUtils');
testUtils.setupLocale('gamelab');
const gamelabMsg = require('@cdo/apps/gamelab/locale');

// We use `require` here because imports get hoisted, and we have to run
// setupLocale before importing AnimationPickerBody.
const moduleUnderTest = require('@cdo/apps/gamelab/AnimationPicker/AnimationPickerBody');
const AnimationPickerBody = moduleUnderTest.default;
const WarningLabel = moduleUnderTest.WarningLabel;

const emptyFunction = function () {};

describe('AnimationPickerBody', function () {
  describe('upload warning', function () {
    let renderer;

    beforeEach(function () {
      renderer = ReactTestUtils.createRenderer();
    });

    function shallowRenderWithProps(props) {
      // Provide default props, with the passed ones overriding them
      props = Object.assign({}, {
        onDrawYourOwnClick: emptyFunction,
        onPickLibraryAnimation: emptyFunction,
        onUploadClick: emptyFunction
      }, props);
      renderer.render(<AnimationPickerBody {...props}/>);
      return renderer.getRenderOutput();
    }

    it('shows an upload warning if the user is under 13', function () {
      const body = shallowRenderWithProps({is13Plus: false});
      const warnings = findChildrenOfType(body, WarningLabel);
      expect(warnings[0]).not.to.be.undefined;
      expect(warnings[0].props.children).to.equal(gamelabMsg.animationPicker_warning());
    });

    it('shows an upload warning if the user age is not known', function () {
      const body = shallowRenderWithProps({is13Plus: undefined});
      const warnings = findChildrenOfType(body, WarningLabel);
      expect(warnings[0]).not.to.be.undefined;
      expect(warnings[0].props.children).to.equal(gamelabMsg.animationPicker_warning());
    });

    it('does not show an upload warning if the user is 13 or older', function () {
      const body = shallowRenderWithProps({is13Plus: true});
      const warnings = findChildrenOfType(body, WarningLabel);
      expect(warnings).to.be.empty();
    });
  });
});

/**
 * @param {Component|string} root
 * @param {function|string} type
 * @returns {Component[]} all components of type that are descendants of root
 */
function findChildrenOfType(root, type) {
  const children = React.Children.toArray(root.props ? root.props.children : undefined);
  return children.reduce((memo, nextChild) =>
      memo.concat(nextChild.type === type ? [nextChild] : [])
          .concat(findChildrenOfType(nextChild, type)),
      []);
}
