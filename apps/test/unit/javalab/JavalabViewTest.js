import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {UnconnectedJavalabView as JavalabView} from '@cdo/apps/javalab/JavalabView';
import JavalabCaptchaDialog from '@cdo/apps/javalab/JavalabCaptchaDialog';

describe('Javalab View', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      onMount: () => {},
      onRun: () => {},
      onStop: () => {},
      onTest: () => {},
      onInputMessage: () => {},
      onContinue: () => {},
      onCommitCode: () => {},
      handleClearPuzzle: () => {},
      onPhotoPrompterFileSelected: () => {},
      isProjectLevel: true,
      viewMode: 'console',
      displayTheme: 'light',
      isProjectTemplateLevel: false,
    };
  });

  it('renders', () => {
    shallow(<JavalabView {...defaultProps} />);
  });

  it('includes captcha dialog to prompt unverified teachers', () => {
    const wrapper = shallow(<JavalabView {...defaultProps} />);
    expect(wrapper.find(JavalabCaptchaDialog)).to.have.lengthOf(1);
  });
});
