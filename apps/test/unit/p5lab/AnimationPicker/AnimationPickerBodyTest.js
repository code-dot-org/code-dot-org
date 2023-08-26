import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
const msg = require('@cdo/locale');
import AnimationPickerBody, {
  WarningLabel,
} from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody';
import AnimationPickerListItem from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerListItem';
import testAnimationLibrary from '../testAnimationLibrary.json';
import {CostumeCategories} from '@cdo/apps/p5lab/spritelab/constants';
import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';
import AnimationUploadButton from '@cdo/apps/p5lab/AnimationPicker/AnimationUploadButton';

const emptyFunction = function () {};

describe('AnimationPickerBody', function () {
  const defaultProps = {
    onDrawYourOwnClick: emptyFunction,
    onPickLibraryAnimation: emptyFunction,
    onUploadClick: emptyFunction,
    playAnimations: false,
    libraryManifest: testAnimationLibrary,
    categories: CostumeCategories,
    hideAnimationNames: false,
    navigable: true,
    hideBackgrounds: false,
    hideCostumes: false,
    defaultQuery: {
      categoryQuery: '',
      searchQuery: '',
    },
    selectedAnimations: [],
    onAnimationSelectionComplete: emptyFunction,
    pickerType: PICKER_TYPE.gamelab,
    shouldWarnOnAnimationUpload: false,
  };

  describe('upload warning', function () {
    it('shows an upload warning if the upload button is visible', function () {
      const body = shallow(<AnimationPickerBody {...defaultProps} />);
      const warnings = body.find(WarningLabel);
      expect(warnings).to.have.length(1);
      expect(warnings.children().text()).to.equal(
        msg.animationPicker_warning()
      );
    });
  });

  describe('handleScroll', () => {
    it('fetches next results if scrolled through 90% of content', () => {
      const mockEvent = {
        target: {
          scrollTop: 450,
          scrollHeight: 500,
        },
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
          scrollHeight: 600,
        },
      };
      const wrapper = shallow(<AnimationPickerBody {...defaultProps} />);
      expect(wrapper.state('currentPage')).to.equal(0);
      wrapper.instance().handleScroll(mockEvent);
      expect(wrapper.state('currentPage')).to.equal(0);
    });
  });
  describe('handleBackgrounds', () => {
    it('does not show backgrounds if hideBackgrounds', function () {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} hideBackgrounds={true} />
      );
      const pickerItems = body.find(AnimationPickerListItem);
      expect(pickerItems.length).to.equal(3);
      const uploadButton = body.find(AnimationUploadButton);
      expect(uploadButton.length).to.equal(1);
    });

    it('does shows backgrounds if not hideBackgrounds', function () {
      const body = shallow(<AnimationPickerBody {...defaultProps} />);
      const pickerItems = body.find(AnimationPickerListItem);
      expect(pickerItems.length).to.equal(4);
      const uploadButton = body.find(AnimationUploadButton);
      expect(uploadButton.length).to.equal(1);
    });

    it('only shows backgrounds if defaultQuery has categoryQuery backgrounds', function () {
      const body = shallow(
        <AnimationPickerBody
          {...defaultProps}
          navigable={false}
          defaultQuery={{
            categoryQuery: 'backgrounds',
            searchQuery: '',
          }}
        />
      );
      const items = body.find(AnimationPickerListItem);
      expect(items.length).to.equal(1);
    });
  });
});
