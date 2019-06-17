import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedExportDialog as ExportDialog} from '@cdo/apps/code-studio/components/ExportDialog';
import {SignInState} from '@cdo/apps/code-studio/progressRedux';

describe('ExportDialog', () => {
  it('renders our signed in version when signed in', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={true}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
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

  it('publishAndGenerateApk() method calls exportApp() thrice with modes expoPublish, expoGenerateApk, and expoCheckApkBuild', async () => {
    const exportApp = sinon.stub();
    exportApp.returns(Promise.resolve('fakeBuildId'));
    const publishResult = Promise.resolve({
      expoUri: 'uri',
      expoSnackId: 'id',
      iconUri: 'iconUri',
      splashImageUri: 'splashUri'
    });
    exportApp.withArgs({mode: 'expoPublish'}).returns(publishResult);
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        exportGeneratedProperties={{}}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    await wrapper.instance().publishAndGenerateApk();
    expect(exportApp)
      .to.have.been.calledThrice.and.calledWith({mode: 'expoPublish'})
      .and.calledWith({
        mode: 'expoGenerateApk',
        md5SavedSources: 'fakeHash',
        expoSnackId: 'id',
        iconUri: 'iconUri',
        splashImageUri: 'splashUri'
      })
      .and.calledWith({
        mode: 'expoCheckApkBuild',
        md5SavedSources: 'fakeHash',
        expoSnackId: 'id',
        apkBuildId: 'fakeBuildId'
      });
  });

  it('exportApp() not called by generateApkAsNeeded() if exportGeneratedProperties contains matching apkUri', () => {
    const exportApp = sinon.spy();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        exportGeneratedProperties={{
          android: {
            md5ApkSavedSources: 'fakeHash',
            snackId: 'fakeSnackId',
            apkBuildId: 'fakeBuildId',
            apkUri: 'fakeApkUri'
          }
        }}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.instance().generateApkAsNeeded();
    expect(exportApp).to.not.have.been.called;
  });

  it('exportApp() will be called by generateApkAsNeeded() if exportGeneratedProperties does not contain matching apkUri', () => {
    const exportApp = sinon.spy();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        exportGeneratedProperties={{
          android: {
            md5ApkSavedSources: 'differentHash',
            snackId: 'fakeSnackId',
            apkBuildId: 'fakeBuildId',
            apkUri: 'fakeApkUri'
          }
        }}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={true}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.instance().generateApkAsNeeded();
    expect(exportApp).to.have.been.called;
  });
});
