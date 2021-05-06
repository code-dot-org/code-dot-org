import React from 'react';
import {expect} from '../../util/reconfiguredChai';
import {shallow} from 'enzyme';
// We use the UnconnectedJavalabView because calling shallow().dive().instance()
// on the connected JavalabView does not give us to access to the methods owned by JavalabView.
// We think this has to do with the version of reac-redux we're using (4.4.9).
import {UnconnectedJavalabView as JavalabView} from '@cdo/apps/javalab/JavalabView';
import color from '@cdo/apps/util/color';
global.$ = require('jquery');

describe('Java Lab View Test', () => {
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
    it('Is cyan or orange in light mode', () => {
      // We use shallow instead of mount because mount loads many
      // shared DOM components which cause collisions with other tests.
      let editor = shallow(<JavalabView {...defaultProps} />);
      const notSettings = editor.instance().getButtonStyles(false);
      expect(notSettings.backgroundColor).to.equal(color.cyan);
      const settings = editor.instance().getButtonStyles(true);
      expect(settings.backgroundColor).to.equal(color.orange);
    });

    it('Is grey in dark mode', () => {
      let props = {...defaultProps, isDarkMode: true};
      let editor = shallow(<JavalabView {...props} />);
      const notSettings = editor.instance().getButtonStyles(false);
      expect(notSettings.backgroundColor).to.equal(color.darkest_gray);
      const settings = editor.instance().getButtonStyles(false);
      expect(settings.backgroundColor).to.equal(color.darkest_gray);
    });
  });
});
