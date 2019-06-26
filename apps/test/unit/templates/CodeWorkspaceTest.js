import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
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

  const studioApp = studioAppSingleton();
  sinon.stub(studioApp, 'showGeneratedCode');
  let workspace = mount(<CodeWorkspace {...MINIMUM_PROPS} />);

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
});
