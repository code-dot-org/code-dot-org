import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {PICKER_TYPE} from '@cdo/apps/p5lab/AnimationPicker/AnimationPicker';
import AnimationPickerBody, {
  WarningLabel,
} from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerBody';
import AnimationPickerListItem from '@cdo/apps/p5lab/AnimationPicker/AnimationPickerListItem';
import AnimationUploadButton from '@cdo/apps/p5lab/AnimationPicker/AnimationUploadButton';
import {CostumeCategories} from '@cdo/apps/p5lab/spritelab/constants';

import testAnimationLibrary from '../testAnimationLibrary.json';

const msg = require('@cdo/locale');

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
    isRestrictedMode: false,
    teacherHasConfirmedUploadWarning: false,
    refreshInRestrictedShareMode: emptyFunction,
    refreshTeacherHasConfirmedUploadWarning: emptyFunction,
    showingUploadWarning: false,
    exitedUploadWarning: emptyFunction,
  };

  describe('upload warning', function () {
    it('shows an upload warning if the upload button is visible', function () {
      const body = shallow(<AnimationPickerBody {...defaultProps} />);
      const warnings = body.find(WarningLabel);
      expect(warnings).toHaveLength(1);
      expect(warnings.children().text()).toBe(msg.animationPicker_warning());
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
      expect(wrapper.state('currentPage')).toBe(0);
      wrapper.instance().handleScroll(mockEvent);
      expect(wrapper.state('currentPage')).toBe(1);
    });

    it('does not fetch next results if not scrolled through 90% of content', () => {
      const mockEvent = {
        target: {
          scrollTop: 0,
          scrollHeight: 600,
        },
      };
      const wrapper = shallow(<AnimationPickerBody {...defaultProps} />);
      expect(wrapper.state('currentPage')).toBe(0);
      wrapper.instance().handleScroll(mockEvent);
      expect(wrapper.state('currentPage')).toBe(0);
    });
  });
  describe('handleBackgrounds', () => {
    it('does not show backgrounds if hideBackgrounds', function () {
      const body = shallow(
        <AnimationPickerBody {...defaultProps} hideBackgrounds={true} />
      );
      const pickerItems = body.find(AnimationPickerListItem);
      expect(pickerItems.length).toBe(3);
      const uploadButton = body.find(AnimationUploadButton);
      expect(uploadButton.length).toBe(1);
    });

    it('does shows backgrounds if not hideBackgrounds', function () {
      const body = shallow(<AnimationPickerBody {...defaultProps} />);
      const pickerItems = body.find(AnimationPickerListItem);
      expect(pickerItems.length).toBe(4);
      const uploadButton = body.find(AnimationUploadButton);
      expect(uploadButton.length).toBe(1);
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
      expect(items.length).toBe(1);
    });
  });
});
