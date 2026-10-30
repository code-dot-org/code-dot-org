import {ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import {mount, shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {workspaceAlertTypes} from '@cdo/apps/code-studio/projectRedux';
import {
  singleton as studioAppSingleton,
  stubStudioApp,
  restoreStudioApp,
} from '@cdo/apps/StudioApp';
import ShowCodeToggle from '@cdo/apps/templates/ShowCodeToggle';
import {getMuiThemeForBrand} from '@cdo/apps/util/brand';

import {UnconnectedCodeWorkspace as CodeWorkspace} from '../../../src/templates/CodeWorkspace';
import {expect} from '../../util/deprecatedChai'; // eslint-disable-line no-restricted-imports

describe('CodeWorkspace', () => {
  const MINIMUM_PROPS = {
    editCode: true,
    isRtl: false,
    readonlyWorkspace: false,
    isRunning: false,
    showDebugger: false,
    pinWorkspaceToBottom: false,
    showProjectTemplateWorkspaceIcon: false,
    isMinecraft: false,
    runModeIndicators: false,
    showMakerToggle: false,
    workspaceAlert: {
      type: workspaceAlertTypes.error,
      message: 'This is an error message',
      displayBottom: false,
    },
    closeWorkspaceAlert: () => {},
  };

  let studioApp, workspace;

  beforeEach(() => {
    stubStudioApp();
    studioApp = studioAppSingleton();
    jest.spyOn(studioApp, 'showGeneratedCode').mockClear().mockImplementation();
    workspace = mount(<CodeWorkspace {...MINIMUM_PROPS} />);
  });

  afterEach(() => {
    studioApp.showGeneratedCode.mockRestore();
    restoreStudioApp();
  });

  // The counter renders as a MuiTypography, so the id selector matches the
  // component, its inner Typography and the DOM element. Take the last, since
  // the display style is set imperatively on the DOM node.
  const blockCounter = () => workspace.find('#blockCounter').last();

  it('onToggleShowCode displays blocks for levels with enableShowBlockCount=true', () => {
    studioApp.enableShowBlockCount = true;

    workspace.find(ShowCodeToggle).simulate('click');
    expect(blockCounter()).to.have.style('display', 'flex');
  });

  it('onToggleShowCode does not display blocks for levels with enableShowBlockCount=false', () => {
    studioApp.enableShowBlockCount = false;

    workspace.find(ShowCodeToggle).simulate('click');
    expect(blockCounter()).to.have.style('display', 'none');
  });

  // The app mounts through createReactRoot, which wraps everything in the brand
  // MUI theme. That theme maps the body/overline variants onto block elements
  // like <p>, so nesting mistakes only surface when the theme is present -
  // unthemed mounts fall back to MUI's <span> default and stay quiet.
  it('renders no invalid DOM nesting under the brand theme', () => {
    const errors = [];
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(msg => errors.push(String(msg)));

    try {
      mount(
        <MuiThemeProvider theme={getMuiThemeForBrand()}>
          <CodeWorkspace {...MINIMUM_PROPS} />
        </MuiThemeProvider>
      );
    } finally {
      consoleError.mockRestore();
    }

    expect(errors.filter(e => e.includes('validateDOMNesting'))).to.be.empty;
  });

  it('displays old version warning when displayOldVersionBanner is true', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{displayOldVersionBanner: true},
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('div#oldVersionBanner')).to.have.lengthOf(1);
  });

  it('displays not started warning when displayNotStartedBanner is true', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{displayNotStartedBanner: true},
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('div#notStartedBanner')).to.have.lengthOf(1);
  });

  it('displays a workspace alert when workspaceAlert exists', () => {
    expect(workspace.find('WorkspaceAlert')).to.have.lengthOf(1);
  });

  it('does not display a workspace alert when workspaceAlert is assigned null ', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{
        workspaceAlert: null,
      },
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('WorkspaceAlert')).to.have.lengthOf(0);
  });

  it('displays a workspace alert at bottom of codeTextbox when editCode = true (implies Droplet)', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{
        editCode: true,
      },
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('WorkspaceAlert')).to.have.lengthOf(1);
    expect(wrapper.find('ProtectedStatefulDiv#codeTextbox')).to.have.lengthOf(
      1
    );
  });

  it('displays a workspace alert at bottom of CodeWorkspace when editCode = false (implies Blockly)', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{
        editCode: false,
      },
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('WorkspaceAlert')).to.have.lengthOf(1);
    expect(wrapper.find('ProtectedStatefulDiv#codeTextbox')).to.have.lengthOf(
      0
    );
  });
});
