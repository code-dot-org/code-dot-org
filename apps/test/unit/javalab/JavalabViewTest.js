import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import JavalabCaptchaDialog from '@cdo/apps/javalab/JavalabCaptchaDialog';
import {UnconnectedJavalabView as JavalabView} from '@cdo/apps/javalab/JavalabView';

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
    expect(wrapper.find(JavalabCaptchaDialog)).toHaveLength(1);
  });
});
