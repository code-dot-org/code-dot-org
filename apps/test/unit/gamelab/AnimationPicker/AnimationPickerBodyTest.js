import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
const gamelabMsg = require('@cdo/gamelab/locale');
const moduleUnderTest = require('@cdo/apps/gamelab/AnimationPicker/AnimationPickerBody');
const AnimationPickerBody = moduleUnderTest.default;
const WarningLabel = moduleUnderTest.WarningLabel;

const emptyFunction = function () {};

describe('AnimationPickerBody', function () {
  describe('upload warning', function () {
    function shallowRenderWithProps(props) {
      // Provide default props, with the passed ones overriding them
      props = Object.assign({}, {
        onDrawYourOwnClick: emptyFunction,
        onPickLibraryAnimation: emptyFunction,
        onUploadClick: emptyFunction
      }, props);
      return shallow(<AnimationPickerBody {...props}/>);
    }

    it('shows an upload warning if the user is under 13', function () {
      const body = shallowRenderWithProps({is13Plus: false});
      const warnings = body.find(WarningLabel);
      expect(warnings).to.have.length(1);
      expect(warnings.children().text()).to.equal(gamelabMsg.animationPicker_warning());
    });

    it('shows an upload warning if the user age is not known', function () {
      const body = shallowRenderWithProps({is13Plus: undefined});
      const warnings = body.find(WarningLabel);
      expect(warnings).to.have.length(1);
      expect(warnings.children().text()).to.equal(gamelabMsg.animationPicker_warning());
    });

    it('does not show an upload warning if the user is 13 or older', function () {
      const body = shallowRenderWithProps({is13Plus: true});
      const warnings = body.find(WarningLabel);
      expect(warnings.isEmpty()).to.be.true;
    });
  });
});
