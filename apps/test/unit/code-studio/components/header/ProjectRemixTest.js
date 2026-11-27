import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import {UnconnectedProjectRemix as ProjectRemix} from '@cdo/apps/code-studio/components/header/ProjectRemix';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getLabViewPageAction} from '@cdo/apps/lab2/utils/getLabViewPageAction';
import {reportViewPageRemixClicked} from '@cdo/apps/lab2/utils/shareEvents';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

jest.mock('@cdo/apps/lab2/utils/getLabViewPageAction', () => ({
  getLabViewPageAction: jest.fn(),
}));
jest.mock('@cdo/apps/lab2/utils/shareEvents', () => ({
  reportViewPageRemixClicked: jest.fn(),
}));

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
        exceedsAbuseThreshold: () => false,
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

  it('does not render when project exceeds abuse threshold', () => {
    const wrapper = shallow(
      <ProjectRemix {...defaultProps} exceedsAbuseThreshold />
    );
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('does not render when the project is in restricted share mode', () => {
    const wrapper = shallow(
      <ProjectRemix {...defaultProps} inRestrictedShareMode />
    );
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('does not render when lab2 project is blocked for abuse', () => {
    const wrapper = shallow(<ProjectRemix {...defaultProps} isBlockedAbuse />);
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it("does not render for a non-owner when the project's text is flagged", () => {
    const wrapper = shallow(
      <ProjectRemix {...defaultProps} isBlockedShareFailure />
    );
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('reports a width change when it stops being blocked', () => {
    const onChangedWidth = sinon.spy();
    const wrapper = shallow(
      <ProjectRemix
        {...defaultProps}
        inRestrictedShareMode
        onChangedWidth={onChangedWidth}
      />
    );

    wrapper.setProps({inRestrictedShareMode: false});

    expect(onChangedWidth.calledOnce).to.be.true;
  });

  it('reports no width change while it stays blocked', () => {
    const onChangedWidth = sinon.spy();
    const wrapper = shallow(
      <ProjectRemix
        {...defaultProps}
        inRestrictedShareMode
        onChangedWidth={onChangedWidth}
      />
    );

    wrapper.setProps({isBlockedAbuse: true});

    expect(onChangedWidth.called).to.be.false;
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
    sinon.stub(utils, 'navigateToHref');

    const wrapper = shallow(<ProjectRemix {...defaultProps} />);
    wrapper.simulate('click');
    expect(utils.navigateToHref.calledOnce).to.be.true;
    expect(utils.navigateToHref.calledWith('/users/sign_in?user_return_to=/'))
      .to.be.true;

    utils.navigateToHref.restore();
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

  describe('for a Lab2 project', () => {
    let saveAndRemix;

    beforeEach(() => {
      saveAndRemix = sinon.spy();
      sinon.stub(Lab2Registry, 'hasEnabledProjects').returns(true);
      sinon
        .stub(Lab2Registry.getInstance(), 'getProjectManager')
        .returns({saveAndRemix});
      reportViewPageRemixClicked.mockClear();
    });

    afterEach(() => {
      Lab2Registry.hasEnabledProjects.restore();
      Lab2Registry.getInstance().getProjectManager.restore();
    });

    it('reports a press on the view page', () => {
      getLabViewPageAction.mockReturnValue('view');
      shallow(<ProjectRemix {...defaultProps} />).simulate('click');
      expect(reportViewPageRemixClicked.mock.calls.length).to.equal(1);
      expect(saveAndRemix.calledOnce).to.be.true;
    });

    it('reports no press on the edit page', () => {
      getLabViewPageAction.mockReturnValue('edit');
      shallow(<ProjectRemix {...defaultProps} />).simulate('click');
      expect(reportViewPageRemixClicked.mock.calls.length).to.equal(0);
      expect(saveAndRemix.calledOnce).to.be.true;
    });
  });
});
