import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
const msg = require('@cdo/locale');
import {
  WarningLabel,
  UnconnectedAnimationPickerBody as AnimationPickerBody
} from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody';

const emptyFunction = function() {};

describe('AnimationPickerBody', function() {
  const defaultProps = {
    onDrawYourOwnClick: emptyFunction,
    onPickLibraryAnimation: emptyFunction,
    onUploadClick: emptyFunction,
    playAnimations: false
  };

  describe('upload warning', function() {
    it('shows an upload warning if the user is under 13', function() {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} is13Plus={false} />
      );
      const warnings = body.find(WarningLabel);
      expect(warnings).to.have.length(1);
      expect(warnings.children().text()).to.equal(
        msg.animationPicker_warning()
      );
    });

    it('shows an upload warning if the user age is not known', function() {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} is13Plus={undefined} />
      );
      const warnings = body.find(WarningLabel);
      expect(warnings).to.have.length(1);
      expect(warnings.children().text()).to.equal(
        msg.animationPicker_warning()
      );
    });

    it('does not show an upload warning if the user is 13 or older', function() {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} is13Plus={true} />
      );
      const warnings = body.find(WarningLabel);
      expect(warnings).not.to.exist;
    });
  });
});
