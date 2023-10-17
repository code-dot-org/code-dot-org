import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedAnimationUploadButton as AnimationUploadButton} from '@cdo/apps/p5lab/AnimationPicker/AnimationUploadButton';
import AnimationPickerListItem from '../../../../src/p5lab/AnimationPicker/AnimationPickerListItem';
import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';

const emptyFunction = () => {};

const defaultProps = {
  onUploadClick: emptyFunction,
  shouldWarnOnAnimationUpload: true,
  isBackgroundsTab: false,
  refreshInRestrictedShareMode: emptyFunction,
  inRestrictedShareMode: false,
  refreshTeacherHasConfirmedUploadWarning: emptyFunction,
  teacherHasConfirmedUploadWarning: false,
  showingUploadWarning: emptyFunction,
  exitedUploadWarning: emptyFunction,
  currentUserType: 'student',
};

describe('AnimationUploadButton', function () {
  describe('student scenarios', () => {
    it('shows warning if should restrict and is not already in restricted mode', () => {
      const body = shallow(<AnimationUploadButton {...defaultProps} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal).at(0);
      expect(warningModal.props().isOpen).to.be.true;
    });

    it('does not show warning if should restrict and is already in restricted mode', () => {
      const combinedProps = {
        ...defaultProps,
        inRestrictedShareMode: true,
      };

      const body = shallow(<AnimationUploadButton {...combinedProps} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal);
      expect(warningModal.at(0).props().isOpen).to.be.false;
    });

    it('does not show warning if should not restrict', () => {
      const combinedProps = {
        ...defaultProps,
        shouldWarnOnAnimationUpload: false,
      };

      const body = shallow(<AnimationUploadButton {...combinedProps} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal);
      expect(warningModal.at(0).props().isOpen).to.be.false;
    });
  });

  describe('teacher scenarios', () => {
    const defaultPropsTeacher = {
      ...defaultProps,
      currentUserType: 'teacher',
    };

    it('shows warning if should restrict and is not already in restricted mode', () => {
      const body = shallow(<AnimationUploadButton {...defaultPropsTeacher} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal).at(0);
      expect(warningModal.props().isOpen).to.be.true;
    });

    it('does not show warning if should restrict and is already in restricted mode', () => {
      const combinedProps = {
        ...defaultPropsTeacher,
        teacherHasConfirmedUploadWarning: true,
      };

      const body = shallow(<AnimationUploadButton {...combinedProps} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal);
      expect(warningModal.at(0).props().isOpen).to.be.false;
    });

    it('does not show warning if should not restrict', () => {
      const combinedProps = {
        ...defaultPropsTeacher,
        shouldWarnOnAnimationUpload: false,
      };

      const body = shallow(<AnimationUploadButton {...combinedProps} />);
      const uploadButton = body.find(AnimationPickerListItem).at(0);
      uploadButton.simulate('click');
      const warningModal = body.find(ImageUploadModal);
      expect(warningModal.at(0).props().isOpen).to.be.false;
    });
  });
});
