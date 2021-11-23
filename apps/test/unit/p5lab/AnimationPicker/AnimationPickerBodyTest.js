import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
const msg = require('@cdo/locale');
import {
  WarningLabel,
  UnconnectedAnimationPickerBody as AnimationPickerBody
} from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody';
import AnimationPickerListItem from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerListItem';
import testAnimationLibrary from '../testAnimationLibrary.json';
import {CostumeCategories} from '@cdo/apps/p5lab/spritelab/constants';

const emptyFunction = function() {};

describe('AnimationPickerBody', function() {
  const defaultProps = {
    onDrawYourOwnClick: emptyFunction,
    onPickLibraryAnimation: emptyFunction,
    onUploadClick: emptyFunction,
    playAnimations: false,
    libraryManifest: testAnimationLibrary,
    categories: CostumeCategories,
    hideUploadOption: false,
    hideAnimationNames: false,
    navigable: true,
    hideBackgrounds: false,
    canDraw: true,
    defaultQuery: {
      categoryQuery: '',
      searchQuery: ''
    },
    selectedAnimations: [],
    onAnimationSelectionComplete: emptyFunction
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
      expect(warnings).to.have.length(0);
    });
  });

  describe('handleScroll', () => {
    it('fetches next results if scrolled through 90% of content', () => {
      const mockEvent = {
        target: {
          scrollTop: 450,
          scrollHeight: 500
        }
      };
      const wrapper = shallow(<AnimationPickerBody {...defaultProps} />);
      expect(wrapper.state('currentPage')).to.equal(0);
      wrapper.instance().handleScroll(mockEvent);
      expect(wrapper.state('currentPage')).to.equal(1);
    });

    it('does not fetch next results if not scrolled through 90% of content', () => {
      const mockEvent = {
        target: {
          scrollTop: 0,
          scrollHeight: 600
        }
      };
      const wrapper = shallow(<AnimationPickerBody {...defaultProps} />);
      expect(wrapper.state('currentPage')).to.equal(0);
      wrapper.instance().handleScroll(mockEvent);
      expect(wrapper.state('currentPage')).to.equal(0);
    });
  });
  describe('handleBackgrounds', () => {
    it('does not show backgrounds if hideBackgrounds', function() {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} hideBackgrounds={true} />
      );
      const items = body.find(AnimationPickerListItem);
      expect(items.length).to.equal(4);
    });

    it('does shows backgrounds if not hideBackgrounds', function() {
      const body = shallow(<AnimationPickerBody {...defaultProps} />);
      const items = body.find(AnimationPickerListItem);
      expect(items.length).to.equal(5);
    });

    it('only shows backgrounds if defaultQuery has categoryQuery backgrounds', function() {
      const body = shallow(
        <AnimationPickerBody
          {...defaultProps}
          canDraw={false}
          navigable={false}
        />
      );
      body.setProps({
        defaultQuery: {
          categoryQuery: 'backgrounds',
          searchQuery: ''
        }
      });
      const items = body.find(AnimationPickerListItem);
      expect(items.length).to.equal(1);
    });
  });
});
