import React from 'react';
import sinon from 'sinon';
import {shallow} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

import {UnconnectedProjectRemix as ProjectRemix} from '@cdo/apps/code-studio/components/header/ProjectRemix';

const defaultProps = {
  refreshProjectName: () => {}
};

describe('ProjectRemix', () => {
  beforeEach(() => {
    replaceOnWindow('dashboard', {
      project: {
        canServerSideRemix: () => {},
        copy: () => {},
        getCurrentId: () => {},
        getCurrentName: () => {},
        serverSideRemix: () => {}
      },
      i18n: {
        t: () => {}
      }
    });

    replaceOnWindow('appOptions', {
      level: {
        projectTemplateLevelName: 'Test Project'
      }
    });
  });

  afterEach(() => {
    restoreOnWindow('dashboard');
    restoreOnWindow('appOptions');
  });

  it('renders', () => {
    shallow(<ProjectRemix {...defaultProps} />);
  });

  it('will attempt serverside remix when possible', () => {
    sinon.stub(window.dashboard.project, 'getCurrentId').returns(true);
    sinon.stub(window.dashboard.project, 'canServerSideRemix').returns(true);
    sinon.spy(window.dashboard.project, 'serverSideRemix');

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(window.dashboard.project.serverSideRemix.calledOnce).to.be.true;

    window.dashboard.project.getCurrentId.restore();
    window.dashboard.project.canServerSideRemix.restore();
    window.dashboard.project.serverSideRemix.restore();
  });

  it('will redirect to sign in if necessary', () => {
    sinon.stub(window.location, 'assign');

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(window.location.assign.calledOnce).to.be.true;
    expect(
      window.location.assign.calledWith(
        '/users/sign_in?user_return_to=/context.html'
      )
    ).to.be.true;

    window.location.assign.restore();
  });

  it('will copy the project', () => {
    sinon.stub(window.dashboard.project, 'copy').resolves();

    const wrapper = shallow(<ProjectRemix {...defaultProps} isSignedIn />);
    wrapper.simulate('click');
    expect(window.dashboard.project.copy.calledOnce).to.be.true;
    expect(window.dashboard.project.copy.calledWith('Remix: Test Project')).to
      .be.true;

    window.dashboard.project.copy.restore();
  });
});
