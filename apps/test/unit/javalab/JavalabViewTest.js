import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow} from 'enzyme';
// We use the UnconnectedJavalabView because calling shallow().dive().instance()
// on the connected JavalabView does not give us to access to the methods owned by JavalabView.
// We think this has to do with the version of reac-redux we're using (4.4.9).
import {UnconnectedJavalabView as JavalabView} from '@cdo/apps/javalab/JavalabView';
import color from '@cdo/apps/util/color';

describe('JavalabView', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      onMount: () => {},
      onRun: () => {},
      onContinue: () => {},
      onCommitCode: () => {},
      onInputMessage: () => {},
      handleVersionHistory: () => {},
      isProjectLevel: false,
      isReadOnlyWorkspace: false,
      isDarkMode: false,
      visualization: <div />
    };
  });

  describe('getButtonStyles', () => {
    it('is cyan in light mode', () => {
      const editor = shallow(<JavalabView {...defaultProps} />);
      const btnStyles = editor.instance().getButtonStyles();
      expect(btnStyles.backgroundColor).to.equal(color.cyan);
    });

    it('is gray in dark mode', () => {
      const editor = shallow(<JavalabView {...defaultProps} isDarkMode />);
      const btnStyles = editor.instance().getButtonStyles();
      expect(btnStyles.backgroundColor).to.equal(color.darkest_gray);
    });
  });
});
