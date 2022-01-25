import React from 'react';
import {mount, shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import {UnconnectedCodeWorkspace as CodeWorkspace} from '../../../src/templates/CodeWorkspace';
import {singleton as studioAppSingleton} from '@cdo/apps/StudioApp';
import sinon from 'sinon';
import ShowCodeToggle from '@cdo/apps/templates/ShowCodeToggle';

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
    showMakerToggle: false
  };

  let studioApp, workspace;

  beforeEach(() => {
    studioApp = studioAppSingleton();
    sinon.stub(studioApp, 'showGeneratedCode');
    workspace = mount(<CodeWorkspace {...MINIMUM_PROPS} />);
  });

  afterEach(() => {
    studioApp.showGeneratedCode.restore();
  });

  it('onToggleShowCode displays blocks for levels with enableShowBlockCount=true', () => {
    studioApp.enableShowBlockCount = true;

    workspace.find(ShowCodeToggle).simulate('click');
    let counter = workspace.find('#blockCounter');
    expect(counter).to.have.style('display', 'inline-block');
  });

  it('onToggleShowCode does not display blocks for levels with enableShowBlockCount=false', () => {
    studioApp.enableShowBlockCount = false;

    workspace.find(ShowCodeToggle).simulate('click');
    let counter = workspace.find('#blockCounter');
    expect(counter).to.have.style('display', 'none');
  });

  it('displays old version warning when displayOldVersionBanner is true', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{displayOldVersionBanner: true}
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('div#oldVersionBanner')).to.have.lengthOf(1);
  });

  it('displays not started warning when displayNotStartedBanner is true', () => {
    const props = {
      ...MINIMUM_PROPS,
      ...{displayNotStartedBanner: true}
    };
    const wrapper = shallow(<CodeWorkspace {...props} />);
    expect(wrapper.find('div#notStartedBanner')).to.have.lengthOf(1);
  });
});
