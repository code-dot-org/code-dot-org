import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedAnimationUploadButton as AnimationUploadButton} from '@cdo/apps/p5lab/AnimationPicker/AnimationUploadButton';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import AnimationPickerListItem from '../../../../src/p5lab/AnimationPicker/AnimationPickerListItem';

const emptyFunction = () => {};

describe('AnimationUploadButton', function() {
  it('shows warning if should restrict and is not already in restricted mode', () => {
    const body = shallow(
      <AnimationUploadButton
        onUploadClick={emptyFunction}
        shouldRestrictAnimationUpload={true}
        isBackgroundsTab={false}
        refreshInRestrictedShareMode={emptyFunction}
        inRestrictedShareMode={false}
        showingUploadWarning={emptyFunction}
        exitedUploadWarning={emptyFunction}
      />
    );
    const uploadButton = body.find(AnimationPickerListItem).at(0);
    uploadButton.simulate('click');
    const warningModal = body.find(BaseDialog).at(0);
    expect(warningModal.props().isOpen).to.be.true;
  });

  it('does not show warning if should restrict and is already in restricted mode', () => {
    const body = shallow(
      <AnimationUploadButton
        onUploadClick={emptyFunction}
        shouldRestrictAnimationUpload={true}
        isBackgroundsTab={false}
        refreshInRestrictedShareMode={emptyFunction}
        inRestrictedShareMode={true}
        showingUploadWarning={emptyFunction}
        exitedUploadWarning={emptyFunction}
      />
    );
    const uploadButton = body.find(AnimationPickerListItem).at(0);
    uploadButton.simulate('click');
    const warningModal = body.find(BaseDialog);
    expect(warningModal.at(0).props().isOpen).to.be.false;
  });

  it('does not show warning if should not restrict', () => {
    const body = shallow(
      <AnimationUploadButton
        onUploadClick={emptyFunction}
        shouldRestrictAnimationUpload={false}
        isBackgroundsTab={false}
        refreshInRestrictedShareMode={emptyFunction}
        inRestrictedShareMode={false}
        showingUploadWarning={emptyFunction}
        exitedUploadWarning={emptyFunction}
      />
    );
    const uploadButton = body.find(AnimationPickerListItem).at(0);
    uploadButton.simulate('click');
    const warningModal = body.find(BaseDialog);
    expect(warningModal.at(0).props().isOpen).to.be.false;
  });

  it('warning message requires both checkboxes to be checked to go forward', () => {
    const body = shallow(
      <AnimationUploadButton
        onUploadClick={emptyFunction}
        shouldRestrictAnimationUpload={true}
        isBackgroundsTab={false}
        refreshInRestrictedShareMode={emptyFunction}
        inRestrictedShareMode={false}
        showingUploadWarning={emptyFunction}
        exitedUploadWarning={emptyFunction}
      />
    );
    const uploadButton = body.find(AnimationPickerListItem).at(0);
    uploadButton.simulate('click');
    const warningModal = body.find(BaseDialog).at(0);
    const buttons = warningModal.find('button');
    console.log(`found ${buttons.length} buttons`);
    let confirmButton = warningModal.find('button').at(1);
    expect(confirmButton.props().disabled).to.be.true;
    const checkboxes = warningModal.find('input');
    checkboxes.at(0).simulate('change', {target: {checked: true}});
    checkboxes.at(1).simulate('change', {target: {checked: true}});
    confirmButton = body.find('button').at(1);
    expect(confirmButton.props().disabled).to.be.false;
  });
});
