import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedProjectRemix as ProjectRemix} from '@cdo/apps/code-studio/components/header/ProjectRemix';
import * as utils from '@cdo/apps/utils';


import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

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
    expect(window.dashboard.project.serverSideRemix).toHaveBeenCalledTimes(1);

    window.dashboard.project.getCurrentId.mockRestore();
    window.dashboard.project.canServerSideRemix.mockRestore();
    window.dashboard.project.serverSideRemix.mockRestore();
  });

  it('will redirect to sign in if necessary', () => {
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(utils.navigateToHref).toHaveBeenCalledTimes(1);
    expect(utils.navigateToHref).toHaveBeenCalledWith('/users/sign_in?user_return_to=/');

    utils.navigateToHref.mockRestore();
  });

  it('will copy the project', () => {
    jest.spyOn(window.dashboard.project, 'copy').mockClear().mockImplementation().resolves();

    const wrapper = shallow(<ProjectRemix {...defaultProps} isSignedIn />);
    wrapper.simulate('click');
    expect(window.dashboard.project.copy).toHaveBeenCalledTimes(1);
    expect(window.dashboard.project.copy).toHaveBeenCalledWith('Remix: Test Project');

    window.dashboard.project.copy.mockRestore();
  });
});
