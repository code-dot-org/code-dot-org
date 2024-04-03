import React from 'react';
import {shallow} from 'enzyme';

import {expect} from '../../../../util/reconfiguredChai';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import * as utils from '@cdo/apps/utils';
import {UnconnectedProjectRemix as ProjectRemix} from '@cdo/apps/code-studio/components/header/ProjectRemix';

const defaultProps = {
  refreshProjectName: () => {},
};

describe('ProjectRemix', () => {
  beforeEach(() => {
    replaceOnWindow('dashboard', {
      project: {
        canServerSideRemix: () => {},
        copy: () => {},
        getCurrentId: () => {},
        getCurrentName: () => {},
        serverSideRemix: () => {},
      },
    });

    replaceOnWindow('appOptions', {
      level: {
        projectTemplateLevelName: 'Test Project',
      },
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
    jest.spyOn(window.dashboard.project, 'getCurrentId').mockClear().mockReturnValue(true);
    jest.spyOn(window.dashboard.project, 'canServerSideRemix').mockClear().mockReturnValue(true);
    jest.spyOn(window.dashboard.project, 'serverSideRemix').mockClear();

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(window.dashboard.project.serverSideRemix.calledOnce).to.be.true;

    window.dashboard.project.getCurrentId.mockRestore();
    window.dashboard.project.canServerSideRemix.mockRestore();
    window.dashboard.project.serverSideRemix.mockRestore();
  });

  it('will redirect to sign in if necessary', () => {
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(utils.navigateToHref.calledOnce).to.be.true;
    expect(
      utils.navigateToHref.calledWith(
        '/users/sign_in?user_return_to=/context.html'
      )
    ).to.be.true;

    utils.navigateToHref.mockRestore();
  });

  it('will copy the project', () => {
    jest.spyOn(window.dashboard.project, 'copy').mockClear().mockImplementation().resolves();

    const wrapper = shallow(<ProjectRemix {...defaultProps} isSignedIn />);
    wrapper.simulate('click');
    expect(window.dashboard.project.copy.calledOnce).to.be.true;
    expect(window.dashboard.project.copy.calledWith('Remix: Test Project')).to
      .be.true;

    window.dashboard.project.copy.mockRestore();
  });
});
