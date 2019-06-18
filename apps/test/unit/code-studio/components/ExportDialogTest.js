import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedExportDialog as ExportDialog} from '@cdo/apps/code-studio/components/ExportDialog';
import {SignInState} from '@cdo/apps/code-studio/progressRedux';

/*
    i18n: PropTypes.shape({
      t: PropTypes.func.isRequired
    }).isRequired,
    exportApp: PropTypes.func,
    projectUpdatedAt: PropTypes.string,
    isAbusive: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    channelId: PropTypes.string.isRequired,
    appType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: PropTypes.bool.isRequired,
    userSharingDisabled: PropTypes.bool,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired

*/

describe('ExportDialog', () => {
  it('renders our signed in version when signed in', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={false}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    expect(wrapper.find('div#project-export')).to.have.lengthOf(1);
  });

  it('renders our signed in version when signed out on project page', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={false}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedOut}
        isProjectLevel={true}
      />
    );
    expect(wrapper.find('div#project-export')).to.have.lengthOf(1);
  });

  it('renders our signed out version when signed out', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={false}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedOut}
        isProjectLevel={false}
      />
    );
    expect(wrapper.find('div#project-export')).to.have.lengthOf(0);
    expect(wrapper.find('p').text()).to.include(
      'You must create a Code.org account'
    );
  });

  it('renders our sharing disabled version when userSharingDisabled is set', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={false}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        userSharingDisabled={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    expect(wrapper.find('div#project-export')).to.have.lengthOf(0);
    expect(wrapper.find('p').text()).to.include('you do not have permissions');
  });

  it('renders a warning when isAbusive is set', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={true}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    expect(wrapper.find('AbuseError')).to.have.lengthOf(1);
  });

  it('renders a warning when canShareSocial is off', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        isAbusive={true}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={false}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    expect(
      wrapper
        .find('p')
        .filterWhere(p => p.text() === 'project.share_u13_warning')
    ).to.have.lengthOf(1);
  });

  it('publishExpoExport() method calls exportApp() with mode expoPublish', () => {
    const exportApp = sinon.spy();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        isAbusive={true}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.instance().publishExpoExport();
    expect(exportApp).to.have.been.calledOnce.and.calledWith({
      mode: 'expoPublish'
    });
  });

  it('publishAndGenerateApk() method calls exportApp() twice with modes expoPublish and expoGenerateApk', async () => {
    const publishResult = Promise.resolve({
      expoUri: 'uri',
      expoSnackId: 'id',
      iconUri: 'iconUri',
      splashImageUri: 'splashUri'
    });
    const exportApp = sinon.stub().returns(publishResult);
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        isAbusive={true}
        isOpen={true}
        channelId="fakeChannelId"
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    await wrapper.instance().publishAndGenerateApk();
    expect(exportApp)
      .to.have.been.calledTwice.and.calledWith({mode: 'expoPublish'})
      .and.calledWith({
        mode: 'expoGenerateApk',
        expoSnackId: 'id',
        iconUri: 'iconUri',
        splashImageUri: 'splashUri'
      });
  });
});
