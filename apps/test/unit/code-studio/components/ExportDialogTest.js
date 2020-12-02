import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedExportDialog as ExportDialog} from '@cdo/apps/code-studio/components/ExportDialog/Dialog';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import i18n from '@cdo/locale';

describe('ExportDialog', () => {
  it('renders our signed in version when signed in', () => {
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
      wrapper.find('p').filterWhere(p => p.text() === i18n.shareU13Warning())
    ).to.have.lengthOf(1);
  });

  it('publishExpoExport() method calls exportApp() with mode expoPublish', () => {
    const exportApp = sinon.spy();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
      mode: 'expoPublish',
      iconFileUrl: undefined
    });
  });

  it('generateApkAsNeeded() method calls exportApp(), expoGenerateApk(), and expoCheckApkBuild()', async () => {
    const exportApp = sinon.stub();
    const publishResult = Promise.resolve({
      expoUri: 'uri',
      expoSnackId: 'id',
      iconUri: 'iconUri',
      splashImageUri: 'splashUri'
    });
    exportApp.returns(publishResult);
    const expoGenerateApk = sinon.stub();
    expoGenerateApk.returns(Promise.resolve('fakeBuildId'));
    const expoCheckApkBuild = sinon.stub();

    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        expoGenerateApk={expoGenerateApk}
        expoCheckApkBuild={expoCheckApkBuild}
        expoCancelApkBuild={async () => ({})}
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
    await wrapper.instance().generateApkAsNeeded();
    expect(exportApp).to.have.been.calledOnce.and.calledWith({
      mode: 'expoPublish',
      iconFileUrl: undefined
    });
    expect(expoGenerateApk).to.have.been.calledOnce.and.calledWith({
      md5SavedSources: 'fakeHash',
      expoSnackId: 'id',
      iconUri: 'iconUri',
      splashImageUri: 'splashUri'
    });
    expect(expoCheckApkBuild).to.have.been.calledOnce.and.calledWith({
      md5SavedSources: 'fakeHash',
      expoSnackId: 'id',
      apkBuildId: 'fakeBuildId'
    });
  });

  it('exportApp() not called by generateApkAsNeeded() if the sources have not changed since the last build', () => {
    const exportApp = sinon.spy();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={exportApp}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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

  it('exportApp() will be called by generateApkAsNeeded() if the sources have changed since the last build', async () => {
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
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={async () => ({})}
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
    await wrapper.instance().generateApkAsNeeded();
    expect(exportApp).to.have.been.called;
  });

  it('An incomplete preexisting build will not be canceled when the dialog is opened if the sources are unchanged', () => {
    const expoCancelApkBuild = sinon.stub();
    const wrapper = mount(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={expoCancelApkBuild}
        exportGeneratedProperties={{
          android: {
            md5ApkSavedSources: 'fakeHash',
            snackId: 'fakeSnackId',
            apkBuildId: 'fakeBuildId'
          }
        }}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={false}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.setProps({isOpen: true});

    expect(expoCancelApkBuild).to.not.have.been.called;
  });

  it('An incomplete preexisting build will be resumed within generateApkAsNeeded when the sources are unchanged', () => {
    const expoCheckApkBuild = sinon.stub();
    const wrapper = shallow(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={expoCheckApkBuild}
        expoCancelApkBuild={async () => ({})}
        exportGeneratedProperties={{
          android: {
            md5ApkSavedSources: 'fakeHash',
            snackId: 'fakeSnackId',
            apkBuildId: 'fakeBuildId'
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

    expect(expoCheckApkBuild).to.have.been.calledWith({
      md5SavedSources: 'fakeHash',
      expoSnackId: 'fakeSnackId',
      apkBuildId: 'fakeBuildId'
    });
  });

  it('An incomplete preexisting build will be canceled when the dialog is opened if the sources hash has changed', () => {
    const expoCancelApkBuild = sinon.stub();
    const wrapper = mount(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={expoCancelApkBuild}
        exportGeneratedProperties={{
          android: {
            md5ApkSavedSources: 'differentHash',
            snackId: 'fakeSnackId',
            apkBuildId: 'fakeBuildId'
          }
        }}
        md5SavedSources="fakeHash"
        isAbusive={false}
        isOpen={false}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.setProps({isOpen: true});

    expect(expoCancelApkBuild).to.have.been.calledWith({
      md5SavedSources: 'differentHash',
      expoSnackId: 'fakeSnackId',
      apkBuildId: 'fakeBuildId'
    });
  });

  it('A complete preexisting build will not be canceled when the dialog is opened if the sources hash has changed', () => {
    const expoCancelApkBuild = sinon.stub();
    const wrapper = mount(
      <ExportDialog
        i18n={{t: id => id}}
        exportApp={async () => ({})}
        expoGenerateApk={async () => ({})}
        expoCheckApkBuild={async () => ({})}
        expoCancelApkBuild={expoCancelApkBuild}
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
        isOpen={false}
        appType="applab"
        onClose={() => {}}
        canShareSocial={true}
        signInState={SignInState.SignedIn}
        isProjectLevel={false}
      />
    );
    wrapper.setProps({isOpen: true});

    expect(expoCancelApkBuild).to.not.have.been.called;
  });
});
